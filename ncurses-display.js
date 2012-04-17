var nc = require('ncurses');

var h = 32;
var w = 32;
var size = h * w;
var win = undefined;
var mem = undefined;
start  = 0x0;

module.exports.init = function(memory, start_value) {
    mem = memory;
    start = start_value;

    win = new nc.Window(h + 2, w + 2);
    win.frame();

    pair = 0;
    colors = nc.colorPair(pair, get_color(0), get_color(7));
    win.attrset(colors);
    nc.showCursor = false;

}

get_color = function(bits) {
    bits = bits % 8;

    switch(bits) {
        case 0: return nc.colors.BLACK;
        case 1: return nc.colors.BLUE;
        case 2: return nc.colors.GREEN;
        case 3: return nc.colors.CYAN;
        case 4: return nc.colors.RED;
        case 5: return nc.colors.MAGENTA;
        case 6: return nc.colors.YELLOW;
        default: return nc.colors.WHITE;
    }
}

module.exports.update = function() {
    var y = 0;
    for (y = 0; y < h; ++y) {
        for (x = 0; x < w; ++x) {
        mem_loc = (x * w) + y;
        memval = mem[mem_loc + start].value;
        d = memval & 0x007f;
        f = (memval & 0x0780) >> 7;
        b = (memval & 0x7800) >> 11;
        if (f == b && f == 0) {
            b = 7;
        }
        blink = (memval & 0x8000) >> 15;
        
        if (blink == 1) {
            win.attrset(nc.attrs.BLINK);
        } else {
            win.attrset(nc.attrs.NORMAL);
        }

        pair = 1;
        colors = nc.colorPair(pair, get_color(f), get_color(b));
        win.attrset(nc.colorPair(0));

        win.print(x + 1, y + 1, String.fromCharCode(d));
        win.refresh();
        }
    }
}

module.exports.set = function(x, y, string) {

    colors = nc.colorPair(0);
    win.attrset(colors);

    win.print(x, y, string);
}

module.exports.reset = function() {
    if (win) win.close();
}
