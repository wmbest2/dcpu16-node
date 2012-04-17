module.exports.registers = registers = {
    A:  { value: 0x0 },
    B:  { value: 0x0 },
    C:  { value: 0x0 },
    I:  { value: 0x0 },
    J:  { value: 0x0 },
    X:  { value: 0x0 },
    Y:  { value: 0x0 },
    Z:  { value: 0x0 },
    PC: { value: 0x0 },
    SP: { value: 0xffff },
    O:  { value: 0x0 },
};

module.exports.program_len = 0x0;
module.exports.memory = memory = new Array(65536);
for (i = 0; i < memory.length; i++) {
    memory[i] = {value: 0x0};
}

operands = function(operand) {
    switch(operand) {
        case 0:  return registers.A;
        case 1:  return registers.B;
        case 2:  return registers.C;
        case 3:  return registers.X;
        case 4:  return registers.Y;
        case 5:  return registers.Z;
        case 6:  return registers.I;
        case 7:  return registers.J;
        case 8:  return getmem(registers.A.value);
        case 9:  return getmem(registers.B.value);
        case 10: return getmem(registers.C.value);
        case 11: return getmem(registers.X.value);
        case 12: return getmem(registers.Y.value);
        case 13: return getmem(registers.Z.value);
        case 14: return getmem(registers.I.value);
        case 15: return getmem(registers.J.value);
        case 16: return getmem(registers.A.value + operands(31).value );
        case 17: return getmem(registers.B.value + operands(31).value );
        case 18: return getmem(registers.C.value + operands(31).value );
        case 19: return getmem(registers.X.value + operands(31).value );
        case 20: return getmem(registers.Y.value + operands(31).value );
        case 21: return getmem(registers.Z.value + operands(31).value );
        case 22: return getmem(registers.I.value + operands(31).value );
        case 23: return getmem(registers.J.value + operands(31).value );
        case 24: return getmem(registers.SP.value++);
        case 25: return getmem(registers.SP.value);
        case 26: return getmem(--registers.SP.value);
        case 27: return registers.SP; // SP
        case 28: return registers.PC; // PC
        case 29: return registers.O;  // O
        case 30: return getmem(operands(31).value);
        case 31: return getmem(registers.PC.value++);
        default: return {value: operand - 32};
    }
};

video = false;

getmem = function(value) {
    if (value >= 0x8000 && value < 0x8400) {
        video = true;
    }
    return memory[value];
}

var getAAA = function(value) {
    return ((value >> 4) & 0x3f);
}

var getBBB = function(value) {
    return ((value >> 10) & 0x3f);
}

var getOp = function(value) {
    return (value & 0x0f).toString();
}

non_standard = {
    0: function(aaa) {},
    1: function(aaa) {
        //console.log("JSR");
        val = operands(aaa).value
        operands(26).value = registers.PC.value;
        registers.PC.value = val;
    },
};

operations = {
    0: function(aaa, bbb) {
        non_standard[aaa](bbb);
    },
    1: function(aaa, bbb) { //SET
        //console.log("SET");
        opaaa = operands(aaa);
        opbbb = operands(bbb);
        opaaa.value = opbbb.value; 
    },
    2: function(aaa, bbb) { //ADD
        //console.log("ADD");
        opaaa = operands(aaa);
        opaaa.value += operands(bbb).value; 
    },
    3: function(aaa, bbb) { //SUB
        //console.log("SUB");
        opaaa = operands(aaa);
        opaaa.value -= operands(bbb).value; 
        opaaa.value &= 0xffff;
    },
    4: function(aaa, bbb) { //MUL
        opaaa = operands(aaa);
        opaaa.value *= operands(bbb).value; 
        opaaa.value &= 0xffff;
    },
    5: function(aaa, bbb) { //DIV
        opaaa = operands(aaa);
        opaaa.value /= operands(bbb).value; 
        opaaa.value &= 0xffff;
    },
    6: function(aaa, bbb) { //MOD
        opaaa = operands(aaa);
        opaaa.value %= operands(bbb).value; 
        opaaa.value &= 0xffff;
    },
    7: function(aaa, bbb) { //SHL
        opaaa = operands(aaa);
        opaaa.value <<= operands(bbb).value; 
    },
    8: function(aaa, bbb) { //SHR
        opaaa = operands(aaa);
        opaaa.value >>= operands(bbb).value; 
    },
    9: function(aaa, bbb) { //AND
        operands(aaa).value &= operands(bbb).value; 
    },
    10: function(aaa, bbb) { //BOR
        operands(aaa).value |= operands(bbb).value; 
    },
    11: function(aaa, bbb) { //XOR
        operands(aaa).value ^= operands(bbb).value; 
    },
    12: function(aaa, bbb) { //IFE
        if (operands(aaa).value != operands(bbb).value) {
            dcpu_skip(); 
        }
    },
    13: function(aaa, bbb) { //IFN
        if (operands(aaa).value == operands(bbb).value) {
            dcpu_skip(); 
        }
    },
    14: function(aaa, bbb) { //IFG
        if (operands(aaa).value <= operands(bbb).value) {
            dcpu_skip(); 
        }
    },
    15: function(aaa, bbb) { //IFB
        if ((operands(aaa).value & operands(bbb).value) == 0) {
            dcpu_skip(); 
        }
    },
};

skip = function(opr) {
    if ((opr >= 0x10 && opr <= 0x17) ||
        (opr >= 0x1e && opr <= 0x1f)) {
        registers.PC.value++;
    }
}

dcpu_skip = function() {
    memval = memory[registers.PC.value++].value;
    skip(getBBB(memval));
    if (memval & 0xf == 0)
        skip(getAAA(memval) & 0xffff);
}

module.exports.init = function(instructions) {
    //console.log("INIT");
    if (instructions !== undefined) {
        module.exports.program_len = instructions.length;
    }

    for (i = 0; i < instructions.length; ++i) {
        memory[i] = {value: instructions[i]};
    }
}

module.exports.step = step = function(step_cb, video_cb, input_cb) {
    memval = memory[registers.PC.value].value;
    registers.PC.value++;

    operations[getOp(memval)](getAAA(memval), getBBB(memval));

    if (step_cb) {
        step_cb();
    }

    if (video) {
        video_cb();
        video = false;
    }
}

module.exports.run = function(step_cb, video_cb, input_cb) {
    while (registers.PC.value < module.exports.program_len) {
        step(step_cb, video_cb, input_cb);
    }
}

module.exports.stop = function() {
    registers.PC.value = module.exports.program_len;
}

module.exports.logRegisters = function() {
    console.log(JSON.stringify(registers));
}
