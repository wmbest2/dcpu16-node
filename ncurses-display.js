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

}

get_color = function(bits) {
    bits = bits
    
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

module.exports.refresh = refresh = function() {
    win.leaveok(true);
    win.refresh();
}

module.exports.update = update = function(mem_loc) {
    y = (mem_loc - start) % w;
    x = Math.floor((mem_loc - start) / h);
    
    memval = mem[mem_loc].value;
    d = memval & 0x007f;
    f = (memval & 0xf000) >> 12;
    b = (memval & 0x0f00) >> 8;
    win.print(0,0, f.toString(16));
    
    win.attrset(nc.colorPair(0, get_color(f), get_color(b)));

    blink = (memval & 0x0080) >> 7;
    
    if (blink == 1) {
        win.attrset(nc.attrs.BLINK);
    } else {
        win.attrset(nc.attrs.NORMAL);
    }

    win.addstr(x + 1, y + 1, String.fromCharCode(d));
}

module.exports.update_all = function() {
    for (i = 0; i < w * h; ++i) {
        mem_loc = i + start;
        update(mem_loc);
    }
    refresh();
}

module.exports.set = function(x, y, string) {
    colors = nc.colorPair(0);
    win.attrset(colors);
    win.print(x, y, string);
}

module.exports.clear = function() {
    win.clear();
    win.frame();
}

module.exports.reset = function() {
    if (win) win.close();
}
