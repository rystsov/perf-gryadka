class ReadIncWriteTest {
    constructor(services, logger, repeats) {
        this.services = services;
        this.logger = logger;
        this.repeats = repeats;
    }
    async run() {
        this.logger.start();
        const opid = this.logger.op("test", "boundary", "*");
        try {
            var threads = [];
            for (const service of this.services) {
                const key = "key" + service.id;
                threads.push(this.startClientThread(service, key));
            }
            for (const thread of threads) {
                await thread;
            }
            this.logger.end(opid, "ok");
        } catch (e) {
            console.info("WTF: ");
            console.info(e);
            this.logger.end(opid, "error");
            await this.logger.stop();
            throw e;
        }
        await this.logger.stop();
    }
    async startClientThread(service, key) {
        service.init();
        for (var i=0;i<this.repeats;i++) {
            let cycleId = -1;
            let opId = -1;
            try {
                while (true) {
                    await this.logger.flush();
                    cycleId = this.logger.op("cycle", service.id, key);
                    opId = this.logger.op("read", service.id, key);
                    const read = await service.read(key);
                    this.logger.end(opId, "ok");
                    opId = this.logger.op("write", service.id, key);
                    
                    let written = null;
                    if (read == null) {
                        written = await service.create(key, "0");
                    } else {
                        written = await service.write(key, read.ver, "" + (parseInt(read.val) + 1));
                    }
                    
                    if (written.isConflict) {
                        this.logger.end(cycleId, "conflict");
                        this.logger.end(opId, "conflict");
                        continue;
                    }
                    if (!written.isOk) {
                        throw new Error();
                    }
                    this.logger.end(opId, "ok");
                    this.logger.end(cycleId, "ok");
                    break;
                }
            } catch (e) {
                this.logger.end(cycleId, "error");
                this.logger.end(opId, "error");
            }
        }
        service.stop();
    }
}

exports.ReadIncWriteTest = ReadIncWriteTest;