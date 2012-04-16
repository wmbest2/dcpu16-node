var fs = require('fs');

module.exports.fileToArray = function(filename, cb) {
    if (filename) {
        data = fs.readFileSync(filename);

        var buf = new Buffer(data);

        out = new Array(buf.length / 2);
        for (i = 0; i < buf.length / 2; ++i) {
            output = (buf[i * 2] << 8) + buf[i * 2 + 1];
            out[i] = output;
        }

        return out;
    }
}
