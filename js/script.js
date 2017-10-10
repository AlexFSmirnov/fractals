function randint(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function get_pixel_color(x, y) {
    var r, g, b;

    x = Math.round(x * 15);
    y = Math.round(y * 15);

    if (x == 0 || y == 0) 
        [r, g, b] = [255, 0, 0];
    else if (x % 10 == 0 || y % 10 == 0) 
        [r, g, b] = [0, 0, 0];
    else 
        [r, g, b] = [0, 0, 255];

    return "rgb(" + r + ", " + g + ", " + b + ")";
}

function draw_fractal() {
    for (var canv_y = 0; canv_y < canvas_h; canv_y++) {
        for (var canv_x = 0; canv_x < canvas_w; canv_x++) {
            // real_x, real_y - real point coordinates on the complex plane.
            // canv_x, canv_y - canvas' points coordinates.
            var real_x = (canv_x / canvas_w) * (cur_x2 - cur_x1) + cur_x1;
            var real_y = (canv_y / canvas_h) * (cur_y2 - cur_y1) + cur_y1;
            var color = get_pixel_color(real_x, real_y);

            ctx.fillStyle = color;
            ctx.fillRect(canv_x, canv_y, 1, 1);
        }
    }
}

function adjust_window() {
    var c_w = document.documentElement.clientWidth;
    var c_h = document.documentElement.clientHeight;
    if (c_w / c_h > canvas.width / canvas.height) {
        document.getElementById("canvas").style = "height: " + c_h + "px";
    } else {
        document.getElementById("canvas").style = "width: " + c_w + "px";
    }
}


function setup() {
    document.body.style.backgroundColor = BACKGROUND_COLOR;
    window.onresize = function(event) {adjust_window();};

    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');


    // Finding perfect canvas resolution based on client's screen size.
    var client_w = document.documentElement.clientWidth;
    var client_h = document.documentElement.clientHeight;
    var coeff = Math.sqrt(PIXEL_AMOUNT) / Math.sqrt(client_w * client_h);
    canvas_w = Math.round(client_w * coeff);
    canvas_h = Math.round(client_h * coeff);
    canvas.width = canvas_w;
    canvas.height = canvas_h;
    
    var plane_w = Math.sqrt(PLANE_AREA * (client_w / client_h));
    var plane_h = Math.sqrt(PLANE_AREA * (client_h / client_w))

    cur_x1 = -Math.round(plane_w) / 2;
    cur_y1 = -Math.round(plane_h) / 2;
    cur_x2 = Math.round(plane_w) / 2;
    cur_y2 = Math.round(plane_h) / 2;

    draw_fractal();
    adjust_window();
}

