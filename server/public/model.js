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
                    type: eventType,
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
    
    recorders.push(createEventRecorder("frontAccEvent", function(sample) {
        return sample.acc.y > treshhold;
    }));

    recorders.push(createEventRecorder("backAccEvent", function(sample) {
        return sample.acc.y < -treshhold;
    }));
  
    /*
    recorders.push(createEventRecorder("speedExceedingEvent", function(sample) {
        return sample.gps.speed > 60;
    }));
    */

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
    
    recorders.forEach(function(recorder) {
        if (recorder.is_happening()) {
            events.push(recorder.stop(samples.length - 1));
        }
    });

    return events;
}

function linkEventsWithSamples(accEvents, samples) {
    accEvents.forEach(function(accEvent) {
        samples
            .slice(accEvent.start_index, accEvent.stop_index)
            .forEach(function(sample) {
                if (!sample.events) {
                    sample.events = [];
                }
                sample.events.push(accEvent);
            });
    });
}

/*
Acceleration: 0,35G-0,4G - Moderate; Hard 0,4G-0,5G; Extreem> 0,5G
Braking: Moderate- 0,4G-0,6G; Hard 0,6G-0,7G; Extreem> 0,7G
Cornering: Moderate 0,45G-0,6G; Hard 0,6-0,75; Extreem>0,75G
*/

function getAccEventDetalization(accEvent, samples) {
    var t1 = samples[accEvent.start_index].timestamp,
        t2 = samples[accEvent.stop_index].timestamp,
        duration = t2 - t1,
        slice = samples.slice(accEvent.start_index, accEvent.stop_index);

    var type = "none",
        average = 0,
        severity = "none";

    function getAverage(value) {
        var sum = 0;
        slice.forEach(function(sample) {
            sum += value(sample);
        });
        return sum / slice.length;
    }

    if (accEvent.type == "frontAccEvent") {
        
        /* braking */
        
        type = "braking";
        average = getAverage(function(sample) { return Math.abs(sample.acc.y); });
        
        if (0.4 < average && average < 0.6) {
            severity = "m";
        } else if (0.6 <= average && average < 0.7) {
            severity = "h";
        } else if (0.7 <= average) {
            severity = "e";
        }

    } else if (accEvent.type == "backAccEvent") {

        /* Acceleration */
        
        type = "acceleration";
        average = getAverage(function(sample) { return Math.abs(sample.acc.y); });

        if (0.35 < average && average < 0.4) {
            severity = "m";
        } else if (0.4 <= average && average < 0.5) {
            severity = "h";
        } else if (0.5 <= average) {
            severity = "e";
        }

    } else if (accEvent.type == "leftAccEvent" || accEvent.type == "rigthAccEvent") {
        
        /* Cornering */
        
        type = "cornering";
        average = getAverage(function(sample) { return Math.abs(sample.acc.x); });

        if (0.45 < average && average < 0.6) {
            severity = "m";
        } else if (0.6 <= average && average < 0.7) {
            severity = "h";
        } else if (0.7 <= average) {
            severity = "e";
        }
    }
    return {
        type: type,
        acc: average,
        severity: severity, 
        duration: duration
    };
}


function getReport(accEvents) {
    
    var report = {
        accelerations: { m: 0, h: 0, e: 0 }, 
        brakings: { m: 0, h: 0, e: 0 }, 
        cornerings: { m: 0, h: 0, e: 0 }
    };

    accEvents.forEach(function(accEvent) {
        var detalization = accEvent.detalization;

        if (detalization.severity == "none") return;

        switch (detalization.type) {
        case 'acceleration':
            report.accelerations[detalization.severity]++;
            break;
        case 'braking':
            report.brakings[detalization.severity]++;
            break;
        case 'cornering':
            report.cornerings[detalization.severity]++;
            break;
        }
    });

    return report;
}
