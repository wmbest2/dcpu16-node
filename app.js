
/**
 * Module dependencies.
 */

var dcpu = require('./dcpu.js');
var loader = require('./loader.js');
var display = require('./ncurses-display.js');
var stdin = process.openStdin(); 
require('tty').setRawMode(true);    

//instructions = loader.fileToArray('/home/bill/Downloads/hello.dcpx');
//instructions = [0x8001, 0x79e1, 0x00a5, 0x00a7, 0x89e3, 0x00a5, 0x79e1, 0x00a6, 0x00a8, 0x89e3, 0x00a6, 0x7c10, 0x007a, 0x7c0c, 0x0300, 0x7c10, 0x0014, 0x8402, 0x7dc1, 0x000d, 0x7c11, 0x008b, 0x8021, 0x7c10, 0x0021, 0x7812, 0x00a0, 0x8422, 0x09ee, 0x009f, 0x7dc1, 0x0017, 0x61c1, 0x25e1, 0x00a1, 0x45e1, 0x00a2, 0x0001, 0x45e1, 0x00a3, 0x0002, 0x45e1, 0x00a4, 0x0003, 0x8051, 0x7c10, 0x0062, 0x85ec, 0x00a3, 0x85e2, 0x00a1, 0x81ec, 0x00a3, 0x85e3, 0x00a1, 0x85ec, 0x00a4, 0x85e2, 0x00a2, 0x81ec, 0x00a4, 0x85e3, 0x00a2, 0x79ec, 0x00a1, 0x00a5, 0x85eb, 0x00a3, 0x81ec, 0x00a1, 0x85eb, 0x00a3, 0x79ec, 0x00a2, 0x00a6, 0x85eb, 0x00a4, 0x81ec, 0x00a2, 0x85eb, 0x00a4, 0x7891, 0x00a1, 0x7911, 0x0001, 0x00a2, 0x7911, 0x0002, 0x00a3, 0x7911, 0x0003, 0x00a4, 0x4451, 0x0004, 0x7c10, 0x0062, 0x8001, 0x61c1, 0x7831, 0x00a1, 0x7841, 0x00a2, 0x7c10, 0x0072, 0x8432, 0x7c10, 0x0072, 0x8442, 0x7c10, 0x0072, 0x8433, 0x7c10, 0x0072, 0x61c1, 0x1071, 0x7c74, 0x0020, 0x0c72, 0x7c72, 0x8000, 0x14f1, 0x61c1, 0x8051, 0x8031, 0x8041, 0x7c10, 0x0072, 0x8442, 0x11ee, 0x00a8, 0x7dc1, 0x007d, 0x8432, 0x0dee, 0x00a7, 0x7dc1, 0x007c, 0x61c1, 0x85c3, 0x0003, 0x0004, 0x0001, 0x0001, 0x0900, 0x0007, 0x0006, 0x0001, 0x0000, 0x0a00, 0x0013, 0x0003, 0x0000, 0x0000, 0x0e00, 0x001b, 0x0008, 0x0000, 0x0001, 0x0c00, 0x0004, 0x0005, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0000, 0x0020, 0x0010];
//console.log((instructions.map(function (x) {return x.toString(16);})).toString());
//instructions = [0x7c51, 0x1234, 0x1441, 0x7dc1, 0x0009, 0x7c44, 0x274d, 0x8442, 0x61c1, 0x8061, 0x1031, 0x1441, 0x7c01, 0x8000, 0x8071, 0x7c10, 0x0005, 0x808c, 0x7dc1, 0x0024, 0x7c4f, 0x7000, 0x7dc1, 0x0024,  0x11a1, 0x0c41, 0x7c10, 0x0005, 0x7c89, 0xff00, 0x7c49, 0x003f,  0x508a, 0x0080, 0x1031, 0x6041, 0x8472, 0x8402, 0x1dfe, 0x0020,  0x7dc1, 0x000f, 0x8462, 0x1ace, 0x7dc1, 0x000e, 0x0c41, 0xb061,  0x7c01, 0x817f, 0x7c71, 0x0020, 0x808c, 0x7dc1, 0x004d, 0x7d0f,  0x0020, 0xffff, 0x7dc1, 0x004f, 0x7c10, 0x0005, 0x2101, 0x0020,  0x7d09, 0x0020, 0xff00, 0x1031, 0x7c39, 0x003f, 0x4d0a, 0x0020,  0x0080, 0x7c89, 0x7fff, 0x7dc1, 0x0052, 0x8101, 0x0020, 0x7d09,  0x0020, 0x7fff, 0x8473, 0x8403, 0x807e, 0x7dc1, 0x0034, 0x8463,  0x806e, 0x7dc1, 0x0032, 0x0c41, 0x7c01, 0x8000, 0x8071, 0x7c10,  0x0005, 0x7c4f, 0x0700, 0x7dc1, 0x0077, 0x7c8f, 0xffff, 0x7dc1,  0x0076, 0x7c81, 0x2000, 0x7c4f, 0x0800, 0x7c81, 0xa000, 0x1031,  0x7c39, 0x003f, 0x4c8a, 0x0080, 0x7dc1, 0x0077, 0x8081, 0x8472,  0x8402, 0x1dfe, 0x0020, 0x7dc1, 0x005f, 0x7dc1, 0x0009, 0x85c3,  0x0030, 0x0030, 0x0031, 0x0031, 0x0032, 0x0033, 0x0033, 0x0034,  0x0035, 0x0036, 0x0037, 0x0038, 0x0038, 0x0039, 0x0026, 0x007c,  0x007c, 0x0021, 0x0021, 0x0040, 0x003d, 0x003d, 0x003a, 0x003a,  0x002a, 0x002a, 0x0023, 0x0023, 0x003c, 0x003e, 0x003e, 0x005f,  0x005f, 0x0054, 0x0059, 0x0059, 0x0055, 0x0044, 0x0051, 0x005a,  0x004a, 0x004a, 0x0049, 0x0058, 0x002d, 0x0020, 0x007e, 0x007e,  0x006f, 0x0069, 0x0077, 0x006c, 0x0072, 0x006b, 0x006d, 0x002f,  0x002f, 0x005c, 0x0027, 0x005b, 0x005d, 0x005e, 0x0029, 0x0060,  0x0000,] 
instructions = loader.fileToArray('/home/bill/Projects/dcpu16/output.dcpx');

dcpu.init(instructions);
display.init(dcpu.memory, 0x8000);


var on_step = function() {
}

on_video = function(mem_loc) {
    display.update(mem_loc);
    display.refresh();
}


started = false;
pc = 0x0;

display.update_all();
stdin.on('keypress', function (chunk, key) {
    if (key && key.ctrl && key.name == 'c') {
        dcpu.stop();
        display.reset();
    } else if (key && key.name == 'p') {
        if (!started) {
            dcpu.registers.PC.value = pc;
            dcpu.run(on_step, on_video);
        } else {
            pc = dcpu.registers.PC.value;
            dcpu.stop();
        }
        started = !started;
    } else if (key && key.name == 'n') {
        dcpu.step(on_step, on_video);
    } else if (key && key.name == 'r') {
        display.clear();
        pc = 0x0 
        dcpu.init(instructions);
        display.init(dcpu.memory, 0x8000);
        started = false;
    } 

});

