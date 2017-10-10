function randint(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function get_pixel_color(x, y) {
    var r, g, b;

    x = Math.round(x * 25);
    y = Math.round(y * 25);

    if (x == 0 || y == 0) 
        [r, g, b] = [255, 0, 0];
    else if (x % 10 == 0 || y % 10 == 0) 
        [r, g, b] = [0, 0, 0];
    else 
        [r, g, b] = [0, 0, 255];

    return "rgb(" + r + ", " + g + ", " + b + ")";
}

function draw_fractal() {
    for (var canv_y = 0; canv_y < CANVAS_HEIGHT; canv_y++) {
        for (var canv_x = 0; canv_x < CANVAS_WIDTH; canv_x++) {
            // real_x, real_y - real point coordinates on the complex plane.
            // canv_x, canv_y - canvas' points coordinates.
            var real_x = (canv_x / CANVAS_WIDTH) * (cur_x2 - cur_x1) + cur_x1;
            var real_y = (canv_y / CANVAS_HEIGHT) * (cur_y2 - cur_y1) + cur_y1;
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

    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;

    cur_x1 = START_X1;
    cur_y1 = START_Y1;
    cur_x2 = START_X2;
    cur_y2 = START_Y2;

    draw_fractal();
    adjust_window();
}

