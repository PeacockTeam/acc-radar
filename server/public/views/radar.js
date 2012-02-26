
var RadarView = (function() {
    var ctx;

    var center_x = 400,
        center_y = 300;

    function drawBG() {
        ctx.beginPath();
        ctx.arc(center_x, center_y, 450, 0, Math.PI*2, true);
        ctx.fillStyle = "white";
        ctx.fill();
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
            ctx.fillText(width / 100 + ' m/s^2', center_x + width + 5, center_y);
            ctx.closePath();
        }
        drawLabelCircle(100);
        drawLabelCircle(200);
        drawLabelCircle(300);
    }

    return {
        showSample: function(sample) {
            drawBG();

            var gps_caption = sample.gps.speed + " m/s" ,
                gps_x = center_x + Math.sin(sample.gps.direction * Math.PI / 180) * sample.gps.speed * 2,
                gps_y = center_y - Math.cos(sample.gps.direction * Math.PI / 180) * sample.gps.speed * 2;

            var acc_caption = sample.acc.a.toFixed(2) + " m/s^2",
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
        },

        clear: function() {
            drawBG();
        }
    };
})();

