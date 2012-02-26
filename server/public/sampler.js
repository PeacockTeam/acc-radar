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
