/* Script for drawing fractals on the complex plane.
 * TABLE OF CONTENTS:
 * 0. Misc functions (randint, etc);
 * 1. Mouse and selection functions.
 * 2. Drawing functions.
 * 3. Display functions.
 */
function randint(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/* MOUSE AND SELECTION */
is_selecting = false;
strict_selection = true;
function  get_mouse_pos(canvas, evt) {
  var rect = canvas.getBoundingClientRect(), // abs. size of element
      scaleX = canvas.width / rect.width,    // relationship bitmap vs. element for X
      scaleY = canvas.height / rect.height;  // relationship bitmap vs. element for Y

  return {
    x: (evt.clientX - rect.left) * scaleX,   // scale mouse coordinates after they have
    y: (evt.clientY - rect.top) * scaleY     // been adjusted to be relative to element
  }
}

function on_mouse_down(canvas, event) {
    var mouse_pos = get_mouse_pos(canvas, event);
    sel_x1 = Math.round(mouse_pos.x);
    sel_y1 = Math.round(mouse_pos.y);

    is_selecting = true;
}
function on_mouse_up() {
    is_selecting = false;
    sel_ctx.clearRect(0, 0, sel_canvas.width, sel_canvas.height);
}

function draw_selection(canvas, event) {
    if (is_selecting) {
        var mouse_pos = get_mouse_pos(canvas, event);
        sel_x2 = Math.round(mouse_pos.x);
        sel_y2 = Math.round(mouse_pos.y);

        // Selection box has the same aspect ratio as client's screen.
        if (strict_selection) {
            var sel_h = Math.round(Math.abs(sel_x2 - sel_x1) *
                                   (sel_canvas.height / sel_canvas.width));
            if (sel_y2 >= sel_y1) {
                sel_y2 = sel_y1 + sel_h;
            } else {
                sel_y2 = sel_y1 - sel_h;
            }
        }

        // Clearing the canvas.
        sel_ctx.clearRect(0, 0, sel_canvas.width, sel_canvas.height);

        // Drawing selection.
        drawRect(sel_ctx, sel_x1, sel_y1, sel_x2, sel_y2, 2);
    }
}

function drawRect(ctx, x1, y1, x2, y2, w) { 
    // Sorting elements;
    if (x1 > x2) {
        x1 = [x2, x2 = x1][0];
    } 
    if (y1 > y2) {
        y1 = [y2, y2 = y1][0];
    }

    // Drawing outline.
    sel_ctx.fillStyle = "rgba(255, 165, 0, 1)";
    ctx.fillRect(x1, y1, (x2 - x1), (y2 - y1));
    ctx.clearRect(x1 + w, y1 + w, (x2 - x1 - 2 * w), (y2 - y1 - 2 * w));

    // Drawing infill.
    sel_ctx.fillStyle = "rgba(255, 165, 0, 0.5)";
    ctx.fillRect(x1 + w, y1 + w, (x2 - x1 - 2 * w), (y2 - y1 - 2 * w));
}
/* (END) MOUSE AND SELECTION (END) */

/* DRAWING FUNCTIONS */
function get_pixel_color(x, y) {
    var r, g, b;

    x = Math.round(x * 15);
    y = Math.round(y * 15);

    if (x == 0 || y == 0) 
        [r, g, b] = [255, 0, 0];
    else if (x % 10 == 0 || y % 10 == 0) 
        [r, g, b] = [150, 150, 255];
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

            frac_ctx.fillStyle = color;
            frac_ctx.fillRect(canv_x, canv_y, 1, 1);
        }
    }
}
/* (END) DRAWING FUNCTIONS (END) */

/* DISPLAY AND SETUP */
function adjust_window() {
    var c_w = document.documentElement.clientWidth;
    var c_h = document.documentElement.clientHeight;
    if (c_w / c_h > fractal_canvas.width / fractal_canvas.height) {
        var style = "height: " + c_h + "px; ";
    } else {
        var style = "width: " + c_w + "px; ";
    }
    document.getElementById('fractal-canvas').style = style + "z-index: 1;";
    document.getElementById('selection-canvas').style = style + "z-index: 2;";
}

function setup() {
    document.body.style.backgroundColor = BACKGROUND_COLOR;
    window.onresize = function(event) {adjust_window();};

    fractal_canvas = document.getElementById('fractal-canvas');
    frac_ctx = fractal_canvas.getContext('2d');
    sel_canvas = document.getElementById('selection-canvas');
    sel_ctx = sel_canvas.getContext('2d');

    sel_canvas.onmousedown = function(event) {on_mouse_down(sel_canvas, event);};
    sel_canvas.onmousemove = function(event) {draw_selection(sel_canvas, event);};
    sel_canvas.onmouseup = function(event) {on_mouse_up();};


    // Finding perfect canvas resolution based on client's screen size.
    var client_w = document.documentElement.clientWidth;
    var client_h = document.documentElement.clientHeight;
    var coeff = Math.sqrt(PIXEL_AMOUNT) / Math.sqrt(client_w * client_h);
    canvas_w = Math.round(client_w * coeff);
    canvas_h = Math.round(client_h * coeff);
    fractal_canvas.width = canvas_w;
    fractal_canvas.height = canvas_h;
    sel_canvas.width = canvas_w;
    sel_canvas.height = canvas_h;
    
    var plane_w = Math.sqrt(PLANE_AREA * (client_w / client_h));
    var plane_h = Math.sqrt(PLANE_AREA * (client_h / client_w))

    cur_x1 = -Math.round(plane_w) / 2;
    cur_y1 = -Math.round(plane_h) / 2;
    cur_x2 = Math.round(plane_w) / 2;
    cur_y2 = Math.round(plane_h) / 2;

    draw_fractal();
    adjust_window();
}
/* (END) DISPLAY AND SETUP (END) */

