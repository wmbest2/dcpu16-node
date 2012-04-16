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
    nc.showCursor = false;

}

module.exports.update = function() {
    var y = 0;
    for (y = 0; y < h; ++y) {
        for (x = 0; x < w; ++x) {
        mem_loc = (x * w) + y;
        memval = mem[mem_loc + start].value;
        c = memval & 0x00ff;

        win.print(x + 1, y + 1, String.fromCharCode(c));
        win.refresh();
        }
    }
}
