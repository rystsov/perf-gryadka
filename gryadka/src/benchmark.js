const fs = require("fs");
const {Logger} = require("./Logger");
const {ReadIncWriteTest} = require("./ReadIncWriteTest");
const {GryadkaService} = require("./GryadkaService");

const settings = JSON.parse(fs.readFileSync("etc/settings.json"));

const logger = new Logger("base.log");

const services = [];
for (let i=0;i<8;i++) {
    const service = new GryadkaService(settings);
    service.id = i;
    services.push(service);
}

const tester = new ReadIncWriteTest(services, logger, 4000);
tester.run();
