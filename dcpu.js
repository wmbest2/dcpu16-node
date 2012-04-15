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
        case 8:  return memory[registers.A.value];
        case 9:  return memory[registers.B.value];
        case 10: return memory[registers.C.value];
        case 11: return memory[registers.X.value];
        case 12: return memory[registers.Y.value];
        case 13: return memory[registers.Z.value];
        case 14: return memory[registers.I.value];
        case 15: return memory[registers.J.value];
        case 16: return memory[registers.A.value + operands(31).value ];
        case 17: return memory[registers.B.value + operands(31).value ];
        case 18: return memory[registers.C.value + operands(31).value ];
        case 19: return memory[registers.X.value + operands(31).value ];
        case 20: return memory[registers.Y.value + operands(31).value ];
        case 21: return memory[registers.Z.value + operands(31).value ];
        case 22: return memory[registers.I.value + operands(31).value ];
        case 23: return memory[registers.J.value + operands(31).value ];
        case 24: return memory[registers.SP.value++];
        case 25: return memory[registers.SP.value];
        case 26: return memory[--registers.SP.value];
        case 27: return registers.SP; // SP
        case 28: return registers.PC; // PC
        case 29: return registers.O;  // O
        case 30: return memory[operands(31).value];
        case 31: return memory[registers.PC.value++];
        default: return {value: operand - 32};
    }
};

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
        console.log("JSR");
        operands(26).value = registers.PC.value;
        registers.PC.value = operands(aaa).value;
    },
};

operations = {
    0: function(aaa, bbb) {
        non_standard[aaa](bbb);
    },
    1: function(aaa, bbb) { //SET
        console.log("SET");
        opaaa = operands(aaa);
        opbbb = operands(bbb);
        opaaa.value = opbbb.value; 
    },
    2: function(aaa, bbb) { //ADD
        console.log("ADD");
        opaaa = operands(aaa);
        opaaa.value += operands(bbb).value; 
    },
    3: function(aaa, bbb) { //SUB
        console.log("SUB");
        opaaa = operands(aaa);
        opaaa.value -= operands(bbb).value; 
    },
    4: function(aaa, bbb) { //MUL
        opaaa = operands(aaa);
        opaaa.value *= operands(bbb).value; 
    },
    5: function(aaa, bbb) { //DIV
        opaaa = operands(aaa);
        opaaa.value /= operands(bbb).value; 
    },
    6: function(aaa, bbb) { //MOD
        opaaa = operands(aaa);
        opaaa.value %= operands(bbb).value; 
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
    console.log("INIT");
    if (instructions !== undefined) {
        module.exports.program_len = instructions.length;
    }

    for (i = 0; i < instructions.length; ++i) {
        memory[i] = {value: instructions[i]};
    }
}

var step = function() {
    memval = memory[registers.PC.value].value;
    registers.PC.value++;

    operations[getOp(memval)](getAAA(memval), getBBB(memval));

    module.exports.onStep();
}

module.exports.run = function() {
    console.log("PC : " + registers.PC.value);
    console.log("RUN");
    while (registers.PC.value < module.exports.program_len) {
        step();
    }
}

module.exports.onStep = function() {
    console.log("MEM: " + memval);
    console.log('OP : ' + getOp(memval));
    console.log('AAA: ' + getAAA(memval));
    console.log('BBB: ' + getBBB(memval));
}

module.exports.logRegisters = function() {
    console.log(JSON.stringify(registers));
}
