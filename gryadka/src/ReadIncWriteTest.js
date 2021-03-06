const Queue = require('avkrash-queue');

class ReadIncWriteTest {
    constructor(services, duration_us) {
        this.services = services;
        this.duration_us = duration_us;
        this.isActive = false;
        this.stat = {
            threads: services.length,
            requests: 0,
            latency: {
                min_us: null,
                max_us: null,
                sum_us: 0
            },
            started: 0,
            ended: 0,
            oks: 0,
            fails: 0,
            conflicts: 0,
            cycles: new Queue(),
            done:0
        };
    }
    dump() {
        console.info("Latency");
        console.info("  Avg (us): " + (this.stat.latency.sum_us / this.stat.requests));
        console.info("  Min (us): " + this.stat.latency.min_us);
        console.info("  Max (us): " + this.stat.latency.max_us);
        console.info("Throughput (rps): " + (1000000 * this.stat.requests / (this.stat.ended - this.stat.started)));
        console.info("Oks: " + this.stat.oks);
        console.info("Fails: " + this.stat.fails);
        console.info("Conflicts: " + this.stat.conflicts);
        console.info("Threads: " + this.stat.threads);
    }
    async run() {
        this.stat.started = time_us();
        this.isActive = true;
        try {
            var threads = [];
            threads.push(this.agg());
            for (const service of this.services) {
                const key = "key" + service.id;
                threads.push(this.startClientThread(service, key));
            }
            for (const thread of threads) {
                await thread;
            }
            this.stat.ended = time_us();
        } catch (e) {
            this.stat.ended = time_us();
            console.info("WTF: ");
            console.info(e);
            throw e;
        }
    }
    async agg() {
        while (this.isActive) {
            await new Promise((resolve, reject) => {
                setTimeout(() => resolve(true), 1000);
            });
            while (!this.stat.cycles.isEmpty()) {
                if (time_us() - this.stat.cycles.peek().ts > 1000 * 1000) {
                    this.stat.cycles.dequeue();
                    this.stat.done-=1;
                } else {
                    break;
                }
            }
            console.info("" + Math.floor(time_us() / (1000 * 1000)) + " " + this.stat.done);
        }
    }
    async measure(action) {
        let result = null;
        let error = null;
        const startedAt = time_us();
        this.stat.requests++;
        try {
            result = await action();
            this.stat.oks++;
        } catch(e) {
            error = { error: e };
            this.stat.fails++;
        }
        const latency = time_us() - startedAt;
        this.stat.latency.sum_us += latency;
        if (this.stat.latency.min_us == null || latency < this.stat.latency.min_us) {
            this.stat.latency.min_us = latency;
        }
        if (this.stat.latency.max_us == null || latency > this.stat.latency.max_us) {
            this.stat.latency.max_us = latency;
        }
        if (error) {
            throw error.e;
        } else {
            return result;
        }
    }
    async startClientThread(service, key) {
        service.init();
        while (this.isActive) {
            try {
                while (true) {
                    this.isActive = time_us() - this.stat.started < this.duration_us;
                    const read = await this.measure(() => service.read(key));
                    let written = null;
                    if (read == null) {
                        written = await this.measure(() => service.create(key, "0"));
                    } else {
                        written = await this.measure(() => service.write(key, read.ver, "" + (parseInt(read.val) + 1)));
                    }
                    if (written.isConflict) {
                        this.stat.oks--;
                        this.stat.conflicts++;
                        continue;
                    }
                    if (!written.isOk) {
                        this.stat.oks--;
                        this.stat.fails++;
                        throw new Error();
                    }
                    this.stat.cycles.enqueue({ ts: time_us() });
                    this.stat.done+=1;
                    break;
                }
            } catch (e) { }
        }
        service.stop();
    }
}

exports.ReadIncWriteTest = ReadIncWriteTest;

function time_us() {
    const [s, ns] = process.hrtime();
    return (s*1e9 + ns) / 1000;
}