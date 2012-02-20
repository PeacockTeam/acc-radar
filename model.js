var createEventRecorder = (function(eventType, predicate) {
    var start_index = undefined;

    return {
        must_happen: predicate, 
        
        is_happening: function() {
            return start_index != undefined;
        },

        start: function(index) {
            start_index = index; 
        },

        stop: function(index) {
            var newEvent = (function() {
                return {
                    eventType: eventType,
                    start_index: start_index,
                    stop_index: index 
                };
            })();
            start_index = undefined; 
            return newEvent;
        }
    };
});

function getAccEvents(samples) {
    var events = [],
        recorders = [];
    
    var treshhold = 0.3;

    recorders.push(createEventRecorder("leftAccEvent", function(sample) {
        return sample.acc.x < -treshhold;
    }));

    recorders.push(createEventRecorder("rigthAccEvent", function(sample) {
        return sample.acc.x > treshhold;
    }));
    
    recorders.push(createEventRecorder("fronAccEvent", function(sample) {
        return sample.acc.y > treshhold;
    }));

    recorders.push(createEventRecorder("backAccEvent", function(sample) {
        return sample.acc.y < -treshhold;
    }));

    samples.forEach(function(sample, i) {
        
        recorders.forEach(function(recorder) {
            if (recorder.must_happen(sample)) {
                if (!recorder.is_happening()) {
                    recorder.start(i);       
                }
            } else if (recorder.is_happening()) {
                events.push(recorder.stop(i));
            }
        });
    
    });

    return events;
}

