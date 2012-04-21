var nc = require('ncurses');

var h = 32;
var w = 32;
var size = h * w;
var win = undefined;
var mem = undefined;
start  = 0x0;
input_start = 0x0;

pairs = undefined;
pairs_len = 0;

module.exports.init = function(memory, start_value) {
    mem = memory;
    start = start_value;

    win = new nc.Window(h + 2, w + 2);
    win.frame();

    pair = 0;
    pairs = new Array(nc.maxColorPairs);
    color = get_pair(get_color(0), get_color(7));
    win.attrset(nc.colorPair(parseInt(color)));
    win.showCursor = false;
    win.refresh();

}

get_pair = function(fore, back) {
    for (pair in pairs) {
        if (pairs[pair] !== undefined && pairs[pair].f == fore && pairs[pair].b == back) {
            return pair;
        }
    }

    if (pairs_len < nc.maxColorPairs) {
        nc.colorPair(pairs_len, fore, back);
        pairs[pairs_len] = {f: fore, b: back};
        p = pairs_len;
        pairs_len++;

        return p;
    }


    return 0; 
}

get_color = function(bits) {
    bits %= 8;
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
    win.refresh();
}

module.exports.update = update = function(mem_loc) {
    if (mem_loc >= start && mem_loc <= start + (h * w) ) {
        p = mem_loc - start;
        x = Math.floor(p / w) + 1;
        y = (p % h) + 1;
        
        memval = mem[mem_loc].value;
        d = memval & 0x007f;
        f = (memval & 0xf000) >> 12;
        b = (memval & 0x0f00) >> 8;
        blink = (memval & 0x0080) >> 7;
        win.attrset(nc.colorPair(0));
        win.addstr(0, 8, (blink).toString(16) + "    ");

        color = get_pair(get_color(f), get_color(b))
        if (color != undefined) {
            type = (blink == 1) ? nc.attrs.BLINK : nc.attrs.NORMAL;
            win.attron(nc.colorPair(parseInt(color)));
            win.attron(type);
        }
        win.addstr(x, y,  String.fromCharCode(d));
    }
    win.refresh();
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
    if (win) {
        win.showCursor = true;
        win.close();
    }
}
