var ctx;
var timer;

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
            samples = data.map(function(e) {
                return {
                    acc: {
                        x: 1000 * e.acc.accX,
                        y: 1000 * e.acc.accY
                    },
                    gps: e.gps, 
                    timestamp: 1000 * e.timestamp
                };
            });

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

$().ready(function () {
    ctx = $('#canvas')[0].getContext("2d");
    $('#canvas').click(function() {
        if (!timer) {
            play();
        }
    });

    Sampler.init(data);
    drawBG();
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
            draw(sample); 
        }
        play();
    } else {
        stop();
        Sampler.reset();
    }
}

function draw(sample) {
    drawBG();
    
    ctx.beginPath();
    ctx.moveTo(512, 512);
    ctx.lineTo(512 + sample.acc.x, 512 - sample.acc.y);
    ctx.lineWidth = 10;
    ctx.strokeStyle = "red";
    ctx.stroke();
    ctx.closePath();
  
    ctx.beginPath();
    ctx.moveTo(512, 512);
    ctx.lineTo(
        512 + Math.sin(sample.gps.direction * Math.PI / 180) * sample.gps.speed,
        512 - Math.cos(sample.gps.speed * Math.PI / 180) * sample.gps.speed * 10);

    ctx.strokeStyle = "blue";
    ctx.stroke();
    ctx.closePath();
}

function drawBG() {
    ctx.beginPath();
    ctx.arc(512, 512, 500, 0, Math.PI*2, true);
    ctx.fillStyle = "grey";
    ctx.fill();
    ctx.strokeStyle="grey";
    ctx.stroke();
    ctx.closePath();
}
