
var Sampler = (function() {
    
    var current_sample_index,
        start_time,
        samples = undefined;

    function getRelatiweTime() {
        if (!start_time) {
            start_time = Date.now();
        }
        var offset = Date.now() - start_time;
        return samples[0].timestamp + offset;
    }

    return {
        init: function(data) {
            samples = data; 
            this.reset();
        },
        is_initialized: function() {
            return samples != undefined;
        },
    
        hasMore: function() {
            return current_sample_index < samples.length;
        },

        getNextSample: function() {
            if (!this.hasMore()) {
                return null;
            }
            
            var last_sample = undefined;
            while (this.hasMore() && samples[current_sample_index].timestamp < getRelatiweTime()) {
                last_sample = samples[current_sample_index];
                current_sample_index++;
            }
            return last_sample || null;
        },

        reset: function() {
            current_sample_index = 0;
            start_time = undefined;
        },

    };
})();

var CurrentEventsView = (function() {
    function getElement(accEvent) {
        switch (accEvent.type) {
            case "frontAccEvent": return $("#event-braking")
            case "backAccEvent": return $("#event-acceleration")
            case "rigthAccEvent": return $("#event-left-cornering")
            case "leftAccEvent": return $("#event-right-cornering")
        }
    }

    function hideAll() {
        $("#event-braking").hide();
        $("#event-acceleration").hide();
        $("#event-right-cornering").hide();
        $("#event-left-cornering").hide();
    }

    return {
        showEvents: function(accEvents) {
            hideAll();
            accEvents.forEach(function(accEvent) {
                getElement(accEvent).show();
            });
        } 
    };
})();

var ReportView = {
    showReport: function(report) {

        $('#report-entries').empty();
        
        function addReportEntry(templData) {
            $("#acc-event-total-score-tmpl")
                .tmpl(templData)
                .appendTo( "#report-entries" );
        }

        addReportEntry(_.extend(report.accelerations, { name: "Accelerations" }));
        addReportEntry(_.extend(report.brakings, { name: "Brakings" }));
        addReportEntry(_.extend(report.cornerings, { name: "Cornerings" }));
    }
};

/* Main script */

var timer = undefined;

$().ready(function() {
   
    /* Init radar */
    Radar.init();
    $('#canvas').click(function() {
        if (!timer && Sampler.is_initialized()) {
            play();
        }
    });
    
    function loadData(file, callback) {
        var reader = new FileReader();
        reader.onload = function(evt) {
            callback(JSON.parse(evt.target.result));
        }
        reader.readAsText(file);
    }

    $('#file').change(function(evt) {
        if (evt.target.files.length > 0) {
            loadData(evt.target.files[0], function(data) {
                proccessData(data);
            });
        }
    });
});

var accEvents;

function proccessData(data) {

    /* Apply filters */
    var samples = Filter.parse(data);
    samples = Filter.movingAverage(samples, 15);
    samples = Filter.accModule(samples);

    /* Get events */
    accEvents = getAccEvents(samples).map(function(accEvent) {
        accEvent.detalization = getAccEventDetalization(accEvent, samples);
        return accEvent;
    });

    /* Get report */
    var report = getReport(accEvents);
    ReportView.showReport(report);

    /* Ready to play */
    linkEventsWithSamples(accEvents, samples);
    Radar.clear();
    Sampler.init(samples);
}

function play() {
    timer = setTimeout("render()", 50);
}

function stop() {
    clearTimeout(timer);
    timer = undefined;
}

function render() {
    if (Sampler.hasMore()) {
        var sample = Sampler.getNextSample();
        if (sample) {
            
            /* Refresh radar */
            Radar.draw(sample); 
            CurrentEventsView.showEvents(sample.events || []);
        }
        play();
    } else {
        stop();
        Sampler.reset();
    }
}

