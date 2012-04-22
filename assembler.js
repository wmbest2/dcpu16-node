
// INCLUDES
var fs = require('fs');

// REGEX for Parsing
var integer = "^\\d+$";
var label = "\\w+";
var register = "(?:[abcijxyzo]|(?:pc)|(?:sp))";
var register_mem = "^\\[(" + register + ")\\]$";
var next_word = "next_word";
var next_word_mem = "\\[" + next_word + "\\]";
var hex = "0[x][a-f0-9]+";
var hex_mem = "\\[(" + hex + ")\\]";
var hex_register_mem = "(?:(?:\\[(" + hex + ")\\s*\\+\\s*(" + register + ")\\]))";
var register_hex_mem = "(?:(?:\\[(" + register + ")\\s*\\+\\s*(" + hex + ")\\]))";
var label_register_mem = "(?:(?:\\[("+ register + "|" + label + ")\\s*\\+\\s*(" + label + "|" + register + ")\\]))";
var text = "(?:(?:\\\"|')(.+)(?:\\\"|'))";

var register_regex = new RegExp("^"+register+"$", 'i');
var register_mem_regex = new RegExp(register_mem, 'i');
var next_word_regex = new RegExp(next_word, 'i');
var next_word_mem_regex = new RegExp(next_word_mem, 'i');
var hex_regex = new RegExp("^"+hex+"$", "i");
var hex_mem_regex = new RegExp("^"+hex_mem+"$", "i");
var hex_register_mem_regex = new RegExp("^"+hex_register_mem+"$", "i");
var register_hex_mem_regex = new RegExp("^"+register_hex_mem+"$", "i");
var label_register_mem_regex = new RegExp("^"+label_register_mem+"$", "i");
var int_regex = new RegExp(integer);
var label_regex = new RegExp("^"+label+"$");
var text_regex = new RegExp(text);
var command_regex = new RegExp("\\s*([a-zA-Z]{3})\\s+(.*)$");
var label_line_regex = new RegExp("\\s*:(\\w+)\\s*([a-zA-Z]{3}.*)?");
var whitespace_reg = new RegExp("^\\s*$");
var pop_push_regex = new RegExp("(?:pop|push)", "i");
var comment_regex = new RegExp("(?:\\s*;.*$)");

value = {
    a: 0x0, b: 0x1, c: 0x2, x: 0x3, y: 0x4, z: 0x5, i: 0x6, j: 0x7,
    a_mem: 0x8, b_mem: 0x9, c_mem: 0xa, 
    x_mem: 0xb, y_mem: 0xc, z_mem: 0xd, 
    i_mem: 0xe, j_mem: 0xf,
    a_next: 0x10, b_next: 0x11, c_next: 0x12,
    x_next: 0x13, y_next: 0x14, z_next: 0x15,
    i_next: 0x16, j_next: 0x17,
    pop: 0x18, sp_mem: 0x19, push: 0x1a,
    sp: 0x1b, pc: 0x1c, o: 0x1d,
    next_word_mem: 0x1e,
    next_word: 0x1f,
    0x0: 0x20, 0x1: 0x21, 0x2: 0x22, 0x3: 0x23, 0x4: 0x24, 0x5: 0x25, 0x6: 0x26, 0x7: 0x27, 0x8: 0x28, 0x9: 0x29, 0xa: 0x2a, 0xb: 0x2b, 0xc: 0x2c, 0xd: 0x2d, 0xe: 0x2e, 0xf: 0x2f,
    0x10: 0x30, 0x11: 0x31, 0x12: 0x32, 0x13: 0x33, 0x14: 0x34, 0x15: 0x35, 0x16: 0x36, 0x17: 0x37, 0x18: 0x38, 0x19: 0x39, 0x1a: 0x3a, 0x1b: 0x3b, 0x1c: 0x3c, 0x1d: 0x3d, 0x1e: 0x3e, 0x1f: 0x3f,
}

//GLOBALS
labels = {};
line_num = 0;

error = function(msg) {
    throw "[Line " + line_num + "]: " + msg
}

getOperandCount = function(opers) {
    var count = 0;
    for (i in opers) {
        val = opers[i];

        hex_val = hex_regex.exec(val);
        int_val = int_regex.exec(val);

        if (hex_register_mem_regex.test(val) ||
            label_register_mem_regex.test(val)) {
            count += 1;
        } else if (register_regex.test(val) ||
            register_mem_regex.test(val) ||
            (hex_val != null && parseInt(hex_val[0]) < 0x1f) ||
            (int_val != null && parseInt(int_val[0]) < 0x1f) ||
            pop_push_regex.test(val)) {
            continue;
       } else if (
            hex_val != null ||
            int_val != null ||
            hex_mem_regex.test(val) ||
            next_word_regex.test(val) ||
            next_word_mem_regex.test(val) ||
            label_regex.test(val)) {
            count += 1;
        } else {
            error(val + " NOT HANDLED PROPERLY");
       }
    }

    return count;
}

getDatCount = function(opers) {
    var count = 0;
    for (o in opers) {
        if (hex_regex.test(opers[o])) {
            count += 1;
        } else if (text_regex.test(opers[o])) {
            string = text_regex.exec(opers[o])[1];
            count += string.length;
        } else {
            error("Invalid DAT arguments");
        }
    }
    return count;
}

handleOpcodeFirstPass = function(op, operands) {
    opercount = 2;

    if (op.toUpperCase() == 'JSR') {
        opercount = 1;
    } else if (op.toUpperCase() == 'DAT') {
        opercount = -1;
    }

    c = 0;
    opr_array = operands.split(new RegExp(",\\s*(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)"));
    if (opercount != -1 && opr_array.length != opercount) {
        error(op.toUpperCase() + " takes " + opercount + " arguments");
    }

    if (op.toUpperCase() == 'DAT') {
        c += getDatCount(opr_array);
    } else {
        c += getOperandCount(opr_array);
    }
    return c;
}

convertToString = function(val) {
    bits = val & 0xff;
    string = String.fromCharCode(bits);
    val >>= 8;
    bits = val & 0xff;
    string = String.fromCharCode(bits) + string;
    return string;
}

convertToNumber = function(str) {

}

handleOperand = function(result, operand, bitshift) {
    var v = 0;
    if (register_regex.test(operand)) {
        register = register_regex.exec(operand)[0].toLowerCase();
        v = value[register] << bitshift;
    } else if (register_mem_regex.test(operand)) {
        register = register_mem_regex.exec(operand)[1];
        v = value[register + "_mem"] << bitshift;
    } else if (hex_register_mem_regex.test(operand)) {
        register = hex_register_mem_regex.exec(operand);
        v = value[register[2] + "_next"] << bitshift;
        result[bitshift == 4 ? 1 : 2] = parseInt(register[1]);
    } else if (register_hex_mem_regex.test(operand)) {
        register = register_hex_mem_regex.exec(operand);
        v = value[register[1] + "_next"] << bitshift;
        result[bitshift == 4 ? 1 : 2] = parseInt(register[2]);
    } else if (int_regex.test(operand)) {
        integer = parseInt(int_regex.exec(operand)[0]);
        if (integer <= 0x1f) {
            v = value[integer] << bitshift;
        } else {
            v = value['next_word'] << bitshift;
            result[bitshift == 4 ? 1 : 2] = integer;
        }
    } else if (hex_regex.test(operand)) {
        integer = parseInt(hex_regex.exec(operand)[0]);
        if (integer <= 0x1f) {
            v = value[integer] << bitshift;
        } else {
            v = value['next_word'] << bitshift;
            result[bitshift == 4 ? 1 : 2] = integer;
        }
    } else if (pop_push_regex.test(operand)) {
        p = pop_push_regex.exec(operand)[0];
        console.log(p);
        v = value[p] << bitshift;
    } else if (hex_mem_regex.test(operand)) {
        hex = hex_mem_regex.exec(operand)[1];
        v = value["next_word_mem"] << bitshift;
        result[bitshift == 4 ? 1 : 2] = parseInt(hex);
    } else if (label_regex.test(operand)) {
        l = label_regex.exec(operand)[0];
        if (labels[l] !== undefined) {
            v = value['next_word'] << bitshift;
            result[bitshift == 4 ? 1 : 2] = labels[l];
        } else {
            error("Label " + l + " has not been defined");
        }
    } else {
        error(operand + " NOT HANDLED");
    }
    result[0] = result[0] + v;

    return result;
}

handleOpcodeSecondPass = function(op, operands) {
    op = op.toUpperCase();
    opr_array = operands.split(new RegExp(",\\s*(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)"));

    result = Array(3);
    if (op == 'SET') {
        result[0] = 0x1;
        result = handleOperand(result, opr_array[0], 4);
        result = handleOperand(result, opr_array[1], 10);
    } else if (op == 'ADD') {
        result[0] = 0x2;
        result = handleOperand(result, opr_array[0], 4);
        result = handleOperand(result, opr_array[1], 10);
    } else if (op == 'SUB') {
        result[0] = 0x3;
        result = handleOperand(result, opr_array[0], 4);
        result = handleOperand(result, opr_array[1], 10);
    } else if (op == 'MUL') {
        result[0] = 0x4;
        result = handleOperand(result, opr_array[0], 4);
        result = handleOperand(result, opr_array[1], 10);
    } else if (op == 'DIV') {
        result[0] = 0x5;
        result = handleOperand(result, opr_array[0], 4);
        result = handleOperand(result, opr_array[1], 10);
    } else if (op == 'MOD') {
        result[0] = 0x6;
        result = handleOperand(result, opr_array[0], 4);
        result = handleOperand(result, opr_array[1], 10);
    } else if (op == 'SHL') {
        result[0] = 0x7;
        result = handleOperand(result, opr_array[0], 4);
        result = handleOperand(result, opr_array[1], 10);
    } else if (op == 'SHR') {
        result[0] = 0x8;
        result = handleOperand(result, opr_array[0], 4);
        result = handleOperand(result, opr_array[1], 10);
    } else if (op == 'AND') {
        result[0] = 0x9;
        result = handleOperand(result, opr_array[0], 4);
        result = handleOperand(result, opr_array[1], 10);
    } else if (op == 'BOR') {
        result[0] = 0xa;
        result = handleOperand(result, opr_array[0], 4);
        result = handleOperand(result, opr_array[1], 10);
    } else if (op == 'XOR') {
        result[0] = 0xb;
        result = handleOperand(result, opr_array[0], 4);
        result = handleOperand(result, opr_array[1], 10);
    } else if (op == 'IFE') {
        result[0] = 0xc;
        result = handleOperand(result, opr_array[0], 4);
        result = handleOperand(result, opr_array[1], 10);
    } else if (op == 'IFN') {
        result[0] = 0xd;
        result = handleOperand(result, opr_array[0], 4);
        result = handleOperand(result, opr_array[1], 10);
    } else if (op == 'IFG') {
        result[0] = 0xe;
        result = handleOperand(result, opr_array[0], 4);
        result = handleOperand(result, opr_array[1], 10);
    } else if (op == 'IFB') {
        result[0] = 0xf;
        result = handleOperand(result, opr_array[0], 4);
        result = handleOperand(result, opr_array[1], 10);
    } else if (op == 'JSR') {
        result[0] = 0x1 << 4;
        result = handleOperand(result, opr_array[0], 10);
    } else {
        error(op + " NOT HANDLED");
    }

    return result;
}

handleLine = function(value, count, buf) {
    // Reset Line Count for second pass
    if (count == 0) {
        line_num = 0;
    }

    line_num++;
    value = value.replace(comment_regex, "");
    if (whitespace_reg.test(value))  {  
        return count;
    }

    label_test = label_line_regex.exec(value);
    command = "";
    if (label_test != null) {
        if (buf === undefined) {
            label = label_test[1];
            labels[label] = count;
            console.log("LABEL "+label+ ": 0x" + count.toString(16));
        }

        if (label_test[2] === undefined) {
            return count;
        } else {
            command = label_test[2];
        }
    } else {
        command = value;
    }


    cmatch = command_regex.exec(command);
    opcode = cmatch[1];
    operands = cmatch[2];

    if (buf !== undefined) {
        values = handleOpcodeSecondPass(opcode, operands)
        var b = 0;
        for(i = 0; i < values.length; ++i) {
            var offset = count + b;
            if (values[i] !== undefined) {
                buf.writeUInt16BE(parseInt(values[i]), offset * 2);
                b++;
            }
        }
    }

    count++;
    count += handleOpcodeFirstPass(opcode, operands);
    return count;
}

readFileData = function(data, output) {
    string = "";
    var line_num = 0;
    var count = 0;
    for (i in data) {
        if (data[i] == '\n') {
            count = handleLine(string, count, output);
            string = "";
        } else {
            string += data[i];
        }
    }
    count = handleLine(string, count, output)
    return count;
}

data = fs.readFileSync(process.argv[2], "UTF-8");
var count = readFileData(data);
output = new Buffer(count * 2);
readFileData(data, output);

fs.writeFile(process.argv[3], output, function (err) {
  if (err) throw err;
  console.log('It\'s saved!');
});

