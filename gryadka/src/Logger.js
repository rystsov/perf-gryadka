const fs = require("fs");
const Promise = require('bluebird');
const write = Promise.promisify(fs.write);

class Logger {
    constructor(path) {
        this.records = [];
        this.id = 1;
        this.path = path;
        this.file = null;
    }
    op(name, client, key) {
        const opid = this.id++;
        const msg = `${time()} ${opid} [ ${client} ${name} ${key}`;
        this.records.push(msg);
        return opid;
    }
    end(opid, type) {
        const msg = `${time()} ${opid} ] ${type}`;
        this.records.push(msg);
    }
    start() {
        this.file = fs.openSync(this.path, "w");
    }
    async flush(isFinal = false) {
        if (isFinal || this.records.length > 400) {
            const records = this.records;
            this.records = [];
            let content = "";
            for (var i=0;i<records.length;i++) {
                content += (records[i] + "\n");
            }
            if (content != "") {
                await write(this.file, content);
            }
        }
    }
    async stop() {
        await this.flush(true);
        fs.closeSync(this.file);
    }
}

function time() {
    const [s, ns] = process.hrtime();
    return s*1e9 + ns;
}

exports.Logger = Logger;
