
/**
 * Module dependencies.
 */

var dcpu = require('./dcpu.js');
var loader = require('./loader.js');
var display = require('./ncurses-display.js');

instructions = loader.fileToArray('/home/bill/test.dcpx');
//console.log((instructions.map(function (x) {return x.toString(16);})).toString());

dcpu.init(instructions);
display.init(dcpu.memory, 0x8000);

var on_step = function() {
    display.update();
}

on_video = function() {
    //STUB
}

on_input = function() {
    //STUB
}

dcpu.run(on_step, on_video, on_input);
