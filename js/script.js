/* Script for drawing fractals on the complex plane.
 * TABLE OF CONTENTS:
 * 0. Misc functions (randint, mod, get, etc);
 * 1. Generation functions.
 * 2. Mouse and selection functions.
 * 3. Drawing functions.
 * 4. Display functions.
 */

/* MISC FUNCTIONS */
function randint(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function mod(n, m) {
    return ((n % m) + m) % m;
}

function get_search_parameters() {
    var prmstr = window.location.search.substr(1);
    return prmstr != null && prmstr != "" ? transformToAssocArray(prmstr) : {};
}

function transformToAssocArray(prmstr) {
    var params = {};
    var prmarr = prmstr.split("&");
    for ( var i = 0; i < prmarr.length; i++) {
        var tmparr = prmarr[i].split("=");
        params[tmparr[0]] = tmparr[1];
    }
    return params;
}
/* (END) MISC FUNCTIONS (END) */

/* GENERATION FUNCTIONS */

types = ['formula', 'mandelbrot', 'julia'];
type = types[1];
function get_pixel_color(x, y) {
    var r, g, b;

    if (type == "formula") {
        r = Math.round(128 + 128 * Math.sin(x + y));
        g = Math.round(128 + (x + y));
        b = Math.round(128 + 128 * Math.sin(x - y));
    } else if (type == "mandelbrot") {
        var iterations = 150;
        var z = new Complex(0);
        var c = new Complex(x, y);
        for (var i = 0; i < iterations; i++) {
            z = z.mul(z).add(c);  // z = z ^ 2 + c;
            if (z.abs() > 100) {
                break;
            }
        }
        var color = Math.round((255 / 32) * i);
        r = color;
        g = color;
        b = color;
    } else if (type == "julia") {
    }



    return "rgb(" + r + ", " + g + ", " + b + ")";
}

/* (END) GENERATION FUNCTIONS (END) */

/* MOUSE AND SELECTION */
is_selecting = false;
strict_selection = false;
function  get_mouse_pos(canvas, evt) {
    if (evt.type.startsWith("touch")) {
        var client_x = evt.touches[0].clientX;
        var client_y = evt.touches[0].clientY;
    } else {
        var client_x = evt.clientX;
        var client_y = evt.clientY;
    }
    
    var rect = canvas.getBoundingClientRect(), // abs. size of element
      scaleX = canvas.width / rect.width,    // relationship bitmap vs. element for X
      scaleY = canvas.height / rect.height;  // relationship bitmap vs. element for Y

  return {
    x: (client_x - rect.left) * scaleX,   // scale mouse coordinates after they have
    y: (client_y - rect.top) * scaleY     // been adjusted to be relative to element
  }
}

function on_mouse_down(canvas, event) {
    var mouse_pos = get_mouse_pos(canvas, event);
    sel_x1 = Math.round(mouse_pos.x);
    sel_y1 = Math.round(mouse_pos.y);

    is_selecting = true;
}

function on_mouse_up(canvas, event) {
    is_selecting = false;
    sel_ctx.clearRect(0, 0, sel_canvas.width, sel_canvas.height);
    
    // If the selection is not strict, we should resize the
    // selection so that it doesn't get distorted.
    if (!strict_selection) {
        var sel_w = sel_x2 - sel_x1;
        var sel_h = sel_y2 - sel_y1;
        if (sel_w / sel_h < canvas_w / canvas_h) {
            var new_sel_w = canvas_w * sel_h / canvas_h;
            sel_x1 -= Math.round((new_sel_w - sel_w) / 2);
            sel_x2 += Math.round((new_sel_w - sel_w) / 2);
        } else {
            var new_sel_h = canvas_h * sel_w / canvas_w;
            sel_y1 -= Math.round((new_sel_h - sel_h) / 2);
            sel_y2 += Math.round((new_sel_h - sel_h) / 2);
        }
    }

    // Zooming in the real coordinates.
    // sel_x2, sel_y2 are global, so we have their values from draw_selection()
    var real_coords_1 = get_real_coords(sel_x1, sel_y1);
    var real_coords_2 = get_real_coords(sel_x2, sel_y2);
    cur_x1 = real_coords_1.x;
    cur_y1 = real_coords_1.y;
    cur_x2 = real_coords_2.x;
    cur_y2 = real_coords_2.y;

    draw_fractal();
    adjust_window();
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
        draw_selection_rect(sel_ctx, sel_x1, sel_y1, sel_x2, sel_y2, 2);
    }
}

function draw_selection_rect(ctx, x1, y1, x2, y2, w) { 
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
function get_real_coords(canv_x, canv_y) {
    var real_x = (canv_x / canvas_w) * (cur_x2 - cur_x1) + cur_x1;
    var real_y = (canv_y / canvas_h) * (cur_y2 - cur_y1) + cur_y1;
    return {x: real_x, y: real_y};
}

function draw_fractal() {
    for (var canv_y = 0; canv_y < canvas_h; canv_y++) {
        for (var canv_x = 0; canv_x < canvas_w; canv_x++) {
            // real_x, real_y - real point coordinates on the complex plane.
            // canv_x, canv_y - canvas' points coordinates.
            var real_coords = get_real_coords(canv_x, canv_y);
//             var real_x = real_coords.x;
//             var real_y = real_coords.y;
            var color = get_pixel_color(real_coords.x, real_coords.y);

            frac_ctx.fillStyle = color;
            frac_ctx.fillRect(canv_x, canv_y, 1, 1);
        }
    }
}
/* (END) DRAWING FUNCTIONS (END) */

/* DISPLAY AND SETUP */
function set_canvas_res(client_w, client_h) {
    var coeff = Math.sqrt(PIXEL_AMOUNT) / Math.sqrt(client_w * client_h);
    canvas_w = Math.round(client_w * coeff);
    canvas_h = Math.round(client_h * coeff);
    fractal_canvas.width = canvas_w;
    fractal_canvas.height = canvas_h;
    sel_canvas.width = canvas_w;
    sel_canvas.height = canvas_h;
}

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

function change_settings() {
    var params = get_search_parameters();
    var keys = Object.keys(params);
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        var val = params[key];

        switch(key) {
          case 'pixel_amount':
            PIXEL_AMOUNT = parseInt(val);
          case 'type':
            type = types[parseInt(val)];
        }
    }
};

function setup() {
    document.body.style.backgroundColor = BACKGROUND_COLOR;
    window.onresize = function(event) {adjust_window();};

    // Gets settings from HTTP GET.
    change_settings();

    fractal_canvas = document.getElementById('fractal-canvas');
    frac_ctx = fractal_canvas.getContext('2d');
    sel_canvas = document.getElementById('selection-canvas');
    sel_ctx = sel_canvas.getContext('2d');

    // Touchscreen.
    sel_canvas.addEventListener('touchstart', 
        function(event) {on_mouse_down(sel_canvas, event)});
    sel_canvas.addEventListener('touchmove',
        function(event) {draw_selection(sel_canvas, event)});
    sel_canvas.addEventListener('touchend',
        function(event) {on_mouse_up(sel_canvas, event)});
    // Mouse.
    sel_canvas.addEventListener('mousedown', 
        function(event) {on_mouse_down(sel_canvas, event)});
    sel_canvas.addEventListener('mousemove',
        function(event) {draw_selection(sel_canvas, event)});
    sel_canvas.addEventListener('mouseup',
        function(event) {on_mouse_up(sel_canvas, event)});

    // Finding perfect canvas resolution based on client's screen size.
    var client_w = document.documentElement.clientWidth;
    var client_h = document.documentElement.clientHeight;
    set_canvas_res(client_w, client_h);
    
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

