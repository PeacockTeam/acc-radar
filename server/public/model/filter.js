var Filter = {

    parse: function(data) {
        return data.map(function(e) {
            return {
                acc: {
                    x: parseFloat(e.acc.x) * 9.8,
                    y: parseFloat(e.acc.y) * 9.8
                },
                gps: {
                    direction: parseFloat(e.gps.direction), 
                    speed: parseFloat(e.gps.speed)
                },
                timestamp: parseInt(e.timestamp)
            };
        });
    },

    movingAverage: function(samples, k) {
        var res = samples.map(function(e) {
            return $.extend(true, {}, e);
        }); // Making deep copy

        for (var i = 0; i < samples.length; i++) {
            
            var sum_x = 0,
                sum_y = 0;
            
            var slice = samples.slice(Math.max(0, i - k), Math.min(samples.length, i + k + 1));
            slice.forEach(function(e) {
                sum_x += e.acc.x;
                sum_y += e.acc.y;
            });

            res[i].acc.x = sum_x / slice.length; 
            res[i].acc.y = sum_y / slice.length;
        }
        return res;
    },

    accModule: function(samples) {
        return samples.map(function(s) {
            var a = Math.sqrt(Math.pow(s.acc.x, 2) + Math.pow(s.acc.y, 2));
            return $.extend(true, { acc: {'a' : a }}, s);
        });
    }
};
