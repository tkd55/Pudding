;(function(w, d){
    var socket = io.connect();

    if (w.DeviceOrientationEvent) {
        alert("DeviceOrientation is not supported");
    }

    d.addEventListener('DOMContentLoaded', function(evt){
        w.addEventListener("accelerationIncludingGravity", function(evt){
            d.getElementById('a').innerText = evt.alpha;
            d.getElementById('b').innerText = evt.beta;
            d.getElementById('g').innerText = evt.gamma;
        }, true);


        w.addEventListener('devicemotion', function(evt) {
            // 加速度
            var v = evt.acceleration;
            var x = v.x;
            var y = v.y;
            var z = v.z;
            
            if(1 < y ){
                socket.emit('pulpulReq', y);
            }
        }, true);

        // 画面を再描画する
        var refresh2 = function(x, y, z, gx, gy, gz, a, b, g) {
            // 回転加速度
            d.getElementById('x').innerText = x;
            d.getElementById('y').innerText = y;
            d.getElementById('z').innerText = z;
        };
    }, false);
})(window, window.document);
