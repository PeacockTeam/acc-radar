
var Sampler = (function() {
    
    var current_sample_index,
        start_time,
        samples;

    function getRelatiweTime() {
        if (!start_time) {
            start_time = Date.now();
        }
        var offset = Date.now() - start_time;
        return samples[0].timestamp + offset;
    }

    return {
        init: function(data) {

            /* convert to valid data */
            samples = data.map(function(e) {
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
            
            /* slice middle */
            samples = (function() { 
                var res = samples.map(function(e) {
                    return $.extend(true, {}, e);
                }); // Making deep copy

                var k = 3;
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
            })();

            samples.forEach(function(s) {
                s.acc.a = Math.sqrt(Math.pow(s.acc.x, 2) + Math.pow(s.acc.y, 2));
            });

            console.log(samples);
            this.reset();
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
        }
    };
})();

var Drawer = (function() {
    var ctx;

    var center_x = 512,
        center_y = 512;

    function drawBG() {
        ctx.beginPath();
        ctx.arc(center_x, center_y, 500, 0, Math.PI*2, true);
        ctx.fillStyle = "grey";
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle="black";
        ctx.stroke();
        ctx.closePath();
        
        function drawLabelCircle(width) {
            /* Circle */
            ctx.beginPath();
            ctx.lineWidth = 1;
            ctx.strokeStyle="black";
            ctx.arc(center_x, center_y, width, 0, Math.PI*2, true);
            ctx.stroke();
            ctx.closePath();

            /* Caption */
            ctx.beginPath();
            ctx.fillStyle = 'black';
            ctx.font = '15px sans-serif';
            ctx.textBaseline = 'top';
            ctx.fillText(width / 100 + ' m/s', center_x + width + 5, center_y);
            ctx.closePath();
        }
        drawLabelCircle(100);
        drawLabelCircle(200);
        drawLabelCircle(300);
    }

    return {
        draw: function(sample) {
            drawBG();

            var gps_caption = sample.gps.speed + " m/s" ,
                gps_x = center_x + Math.sin(sample.gps.direction * Math.PI / 180) * sample.gps.speed * 15,
                gps_y = center_y - Math.cos(sample.gps.direction * Math.PI / 180) * sample.gps.speed * 15;

            var acc_caption = sample.acc.a.toFixed(2) + " m/s",
                acc_x = center_x + 100 * sample.acc.x,
                acc_y = center_y - 100 * sample.acc.y;

            /* Draw GPS vector */
            ctx.beginPath();
            ctx.moveTo(center_x, center_y);
            ctx.lineTo(gps_x, gps_y);
            ctx.lineWidth = 2;
            ctx.strokeStyle = "blue";
            ctx.stroke();
            ctx.closePath();
            
            /* Draw GPS caption */
            ctx.beginPath();
            ctx.fillStyle = 'black';
            ctx.font = '20px sans-serif';
            ctx.textBaseline = 'top';
            ctx.fillText(gps_caption, gps_x, gps_y);
            ctx.closePath();

            /* Draw Acc vector */
            ctx.beginPath();
            ctx.moveTo(center_x, center_y);
            ctx.lineTo(acc_x, acc_y);
            ctx.lineWidth = 10;
            ctx.strokeStyle = "red";
            ctx.stroke();
            ctx.closePath();
            
            /* Draw Acc caption */
            ctx.beginPath();
            ctx.fillStyle = 'black';
            ctx.font = '30px sans-serif';
            ctx.textBaseline = 'top';
            ctx.fillText(acc_caption, acc_x, acc_y);
            ctx.closePath();
        },

        init: function() {
            ctx = $('#canvas')[0].getContext("2d");
            drawBG();
        }
    };
})();


var timer;

$().ready(function () {
    Sampler.init(data);
    Drawer.init();
    
    $('#canvas').click(function() {
        if (!timer) {
            play();
        }
    });
});

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
            Drawer.draw(sample); 
        }
        play();
    } else {
        stop();
        Sampler.reset();
    }
}

