
/**
 * Module dependencies.
 */

var dcpu = require('./dcpu.js');
var loader = require('./loader.js');

instructions = loader.fileToArray('/home/bill/Downloads/output (1).dcpx');
console.log((instructions.map(function (x) {return x.toString(16);})).toString());

dcpu.init(instructions);

var on_step = function() {
    dcpu.logRegisters();
}

on_video = function() {
    //STUB
}

on_input = function() {
    //STUB
}

dcpu.run(on_step, on_video, on_input);
