var Model = (function () {
    var samples = [],
        acc_events = [],
        drive_events = [],
        special_events = [];
   
    var basicAccEventRecorder = (function() {
        var is_happening = false,
            start_index = 0,
            current_index = 0;

        var basicAccEventModel = (function() {
            return {
                getStartIndex: function() {
                    return start_index;
                },
                
                getStopIndex: function() {
                    return stop_index;
                }
            };
        });

        return {
            basicAccEventModel: basicAccEventModel; 

            start_event: function(sample_index) {
                start_index = sample_index;
                is_happening = true;
            },

            stop_event: function(sample_index) {
                return {
                    type: this.type,
                    start_index: start_index,
                    stop_index: sample_index,
                };
            }
        };
    });

    var frontAccEventRecorder = (function() {
        var threshhold = 0.3;
        
        return {
            type: 'front',

            must_happen: function(s) {
                return s.acc.x > threshhold; 
            }
        };

    });

    var frontAccEventModel = _.extend(basicAccEventModel(), (function() {
        var threshhold = 0.3;
        return {
            type: 'front',

            must_happen: function(s) {
                return s.acc.x > threshhold; 
            }
        };
    })());
    
    basicEventsModels = [];

    return {
        
        init: function(data) {
            samples = data;
        },
        
        getBasicEvents: function() {

            
            samples.forEach(function(s) {
                
                basicEventsModels.forEach(m) {
                    if (m.isIn(s)) {


                    }
                };

            });

            return [];
        },
        
        getDriveEvents: function(samples) {


            return [];
        }
    };
});
