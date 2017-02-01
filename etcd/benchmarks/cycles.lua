local tid = 1
local threads = {}

function setup(thread)
   thread:set("tid", tid)
   thread:set("key", "key" .. tid)
   thread:set("state", 0) -- 0 is read, 1 is create, 2 is write
   thread:set("ver", 0)   -- version of the last read value
   thread:set("val", 0)   -- initial or last read value
   table.insert(threads, thread)
   tid = tid + 1
end

function init(args)
   reqid = 0
end

function response(status, header, body)
    if state == 0 then
        if status == 404 then
            state = 1
        elseif status == 200 then
            val = tonumber(body:match("\"value\":\"([^\"]+)\""))
            ver = tonumber(body:match("\"modifiedIndex\":(%d+)"))
            state = 2
        else
            print("WTF?!")
        end
    elseif state == 1 then
        state = 0
    elseif state == 2 then
        state = 0
    end
    reqid = reqid + 1
end

function request()
    if state == 0 then
        local url = "http://10.0.0.5:2379/v2/keys/" .. key
        return wrk.format("GET", url, {}, nil)
    elseif state == 1 then
        local url     = "http://10.0.0.5:2379/v2/keys/" .. key .. "?prevExist=false"
        local body    = "value=0"
        local headers = {["Content-Type"] = "application/x-www-form-urlencoded"}
        return wrk.format("PUT", url, headers, body)
    elseif state == 2 then
        local url     = "http://10.0.0.5:2379/v2/keys/" .. key .. "?prevIndex=" .. ver
        local body    = "value=" .. (val + 1)
        local headers = {["Content-Type"] = "application/x-www-form-urlencoded"}
        return wrk.format("PUT", url, headers, body)
    end
end