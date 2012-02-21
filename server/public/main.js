
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
    (function() {
        $('#acc-m').text(report.accelerations.m);
        $('#acc-h').text(report.accelerations.h);
        $('#acc-e').text(report.accelerations.e);
        $('#break-m').text(report.brakings.m);
        $('#break-h').text(report.brakings.h);
        $('#break-e').text(report.brakings.e);
        $('#corn-m').text(report.cornerings.m);
        $('#corn-h').text(report.cornerings.h);
        $('#corn-e').text(report.cornerings.e);
    })();
    
    /* Ready to play */
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
            Radar.draw(sample); 
        }
        play();
    } else {
        stop();
        Sampler.reset();
    }
}

