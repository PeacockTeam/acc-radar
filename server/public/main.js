/* Main script */

var timer = undefined;

$().ready(function() {
   
    RadarView.init();

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

var modelEvents;


/* All data manipulations are done here */

function proccessData(data) {
    
    /* Apply filters */
    var samples = Filter.parse(data);
    samples = Filter.movingAverage(samples, 15);
    samples = Filter.accModule(samples);

    /* Get events */
    modelEvents = Model.getEvents(samples);

    /* Get report */
    var report = Model.getReport(modelEvents, samples);
    ReportView.showReport(report);

    /* Ready to play */
    Model.linkEventsWithSamples(modelEvents, samples);

    RadarView.clear();
    Sampler.init(samples);
    play();
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
            
            RadarView.showSample(sample); 
            CurrentEventsView.showEvents(sample.events || []);
        }
        play();
    } else {
        stop();
        Sampler.reset();
    }
}

