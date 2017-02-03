const minimist = require('minimist');
const fs = require("fs");
const {ReadIncWriteTest} = require("./ReadIncWriteTest");
const {GryadkaService} = require("./GryadkaService");

const settings = JSON.parse(fs.readFileSync("etc/settings.json"));


const args = Object.assign({
    c:1,
    d:"10s"
}, minimist(process.argv.slice(2)));

const services = [];
for (let i=0;i<args.c;i++) {
    const service = new GryadkaService(settings);
    service.id = i;
    services.push(service);
}

let duration_us = null;

let s = /^(\d+)s$/.exec(args.d);
if (s) {
    duration_us = parseInt(s[1]) * 1000 * 1000;
}
s = /^(\d+)m$/.exec(args.d);
if (s) {
    duration_us = parseInt(s[1]) * 60 * 1000 * 1000;
}

if (duration_us == null) {
    throw new Error("unknown duration: " + args.d);
}

const tester = new ReadIncWriteTest(services, duration_us);
(async () => {
    await tester.run();
    tester.dump();
})()
