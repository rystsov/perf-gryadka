const {Cache, AcceptorClient, Proposer} = require("gryadka");
const {log, msg} = require("gryadka/src/utils/Logging");

class GryadkaService {
    constructor(settings) {
        const acceptors = settings.proposer.acceptors.map(aid => settings.acceptors[aid]);
        this.cache = new Cache(settings.proposer.id);
        this.acceptors = acceptors.map(x => new AcceptorClient(x));
        this.proposer = new Proposer(this.cache, this.acceptors, settings.proposer.quorum);
    }

    init() {
        this.acceptors.forEach(x => x.start());
    }

    async read(key, onEmpty) {
        let value = await this.proposer.changeQuery(key, x=>[x, null], x=>x, null);
        if (value.status == "OK") {
            value = value.details;
            if (value == null) {
                return onEmpty;
            } else {
                return { ver: value.ver, val: value.val };
            }
        } else {
            throw new Error(value);
        }
    }

    async create(key, val) {
        const status = await this.proposer.changeQuery(key, create(val), x=>x, null);
        if (status.status == "OK") {
            return { isConflict: false, isOk: true };
        } else {
            return { isConflict: true, isOk: false };
        }
    }

    async write(key, ver, val) {
        const status = await this.proposer.changeQuery(key, update(ver, val), x=>x, null);
        if (status.status == "OK") {
            return { isConflict: false, isOk: true };
        } else {
            return { isConflict: true, isOk: false };
        }
    }

    stop() {
        this.acceptors.forEach(x => x.close());
    }
}

exports.GryadkaService = GryadkaService;

function create(val) {
    return function (state) {
        if (state!=null) [null, log().append(msg("ERRNO012"))]
        return [{
            ver: 0,
            val: val
        }, null]
    }
}

function update(ver, val) {
    return function (state) {
        if (state==null) [null, log().append(msg("ERRNO010"))]
        if (state.ver != ver) {
            return [state, log().append(msg("ERRNO011"))]
        } else {
            return [{
                ver: ver+1,
                val: val
            }, null]
        }
    }
}