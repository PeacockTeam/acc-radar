var Model = (function() {

    /*
     * Internal methods
     */

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

    function recordEvents(samples) {
        var events = [],
            recorders = [];
        
        var acc_threshhold = 0.3;
        var speed_threshhold = Profile.modelProfile.speed.severity.m.from;

        recorders.push(createEventRecorder("leftAccEvent", function(sample) {
            return sample.acc.x < -acc_threshhold;
        }));

        recorders.push(createEventRecorder("rightAccEvent", function(sample) {
            return sample.acc.x > acc_threshhold;
        }));
        
        recorders.push(createEventRecorder("frontAccEvent", function(sample) {
            return sample.acc.y > acc_threshhold;
        }));

        recorders.push(createEventRecorder("backAccEvent", function(sample) {
            return sample.acc.y < -acc_threshhold;
        }));
      
        recorders.push(createEventRecorder("speedEvent", function(sample) {
            return sample.gps.speed > speed_threshhold;
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
        
        recorders.forEach(function(recorder) {
            if (recorder.is_happening()) {
                events.push(recorder.stop(samples.length - 1));
            }
        });

        return events;
    }

    function getEventDetalization(modelEvent, samples, profile) {

        var t1 = samples[modelEvent.start_index].timestamp,
            t2 = samples[modelEvent.stop_index].timestamp,
            duration = t2 - t1,
            slice = samples.slice(modelEvent.start_index, modelEvent.stop_index);

        function getAverage(value) {
            var sum = 0;
            slice.forEach(function(sample) {
                sum += value(sample);
            });
            return sum / slice.length;
        }

        function getSeverity(average, severityParams) {

            if (severityParams.m.from <= average && average < severityParams.m.to) {
                return "m";
            } else if (severityParams.h.from <= average && average < severityParams.h.to) {
                return "h";
            } else if (severityParams.e.from <= average) {
                return "e";
            } else {
                return null;
            }
        }
        
        var type = null,
            average = 0,
            severity = null;

        switch (modelEvent.type) {
            case "frontAccEvent":
                type = "braking";
                average = getAverage(function(sample) { return Math.abs(sample.acc.y); });
                severity = getSeverity(average, profile.braking.severity);
                break;

            case "backAccEvent":
                type = "acceleration";
                average = getAverage(function(sample) { return Math.abs(sample.acc.y); });
                severity = getSeverity(average, profile.acceleration.severity);
                break;

            case "leftAccEvent":
            case "rightAccEvent":
                type = "cornering";
                average = getAverage(function(sample) { return Math.abs(sample.acc.x); });
                severity = getSeverity(average, profile.cornering.severity);
                break;

            case "speedEvent":
                type = "speed";
                average = getAverage(function(sample) { return Math.abs(sample.gps.speed); });
                severity = getSeverity(average, profile.speed.severity);
                break;
        }

        return {
            type: type,
            value: average,
            severity: severity, 
            duration: duration
        };
    }
    
    function getTotalScore(report, profile) {

        function getEventsScore(severities, coefficients) {
            return severities.m * coefficients.m +
                severities.h * coefficients.h +
                severities.e * coefficients.e;
        }

        return profile.summary.acceleration * getEventsScore(report.accelerations, profile.acceleration) +
            profile.summary.braking * getEventsScore(report.brakings, profile.braking) +
            profile.summary.cornering * getEventsScore(report.cornerings, profile.cornering) +
            profile.summary.speed * getEventsScore(report.speeds, profile.speed);
    }


return {
    
    /*
     * Public methods
     */

    getEvents: function(samples) {
        var modelEvents = recordEvents(samples);

        return modelEvents.map(function(modelEvent) {
            modelEvent.detalization = getEventDetalization(modelEvent, samples, Profile.modelProfile);
            return modelEvent;
        });
    },

    getReport: function(modelEvents, samples) {
        
        var report = {
            time: { start: 0, stop: 0 },
            accelerations: { m: 0, h: 0, e: 0 }, 
            brakings: { m: 0, h: 0, e: 0 }, 
            cornerings: { m: 0, h: 0, e: 0 },
            speeds: { m: 0, h: 0, e: 0 },
            score: 0
        };

        modelEvents.forEach(function(modelEvent) {
            var detalization = modelEvent.detalization;

            if (!detalization.severity) {
                return;
            }

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
            case 'speed':
                report.speeds[detalization.severity]++;
                break;
            }
        });
       
        report.time.start = _.first(samples).timestamp;
        report.time.stop = _.last(samples).timestamp;
       
        //var duration = report.time.stop - report.time.start;
        report.score = getTotalScore(report, Profile.scoreProfile);
        
        return report;
    },
    
    linkEventsWithSamples: function(modelEvents, samples) {

        modelEvents.forEach(function(modelEvent) {
            samples
                .slice(modelEvent.start_index, modelEvent.stop_index)
                .forEach(function(sample) {
                    if (!sample.events) {
                        sample.events = [];
                    }
                    sample.events.push(modelEvent);
                });
        });
    }

};
})();
