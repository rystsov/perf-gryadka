## Setting

**Cloud**: Azure / East US

**Data nodes:** 3 x Standard DS12 v2

**Client node:** 1 x Standard DS12 v2

| hdparm -Tt /dev/sdb1 |
| --- |
| Timing cached reads:   18842 MB in  2.00 seconds = 9429.78 MB/sec |
| Timing buffered disk reads: 394 MB in  3.01 seconds = 130.76 MB/sec |

## Comparison

**Etcd:** wrk -t8 -c8 -s benchmarks/cycles.lua -d10m http://10.0.0.4:2379

**Gryadka:** ./bin/benchmark.sh -c 8 -d 10m http://10.0.0.4:2379

| System | Avg Latency | Max Latency | Requests/sec |
| --- | --- | --- | --- |
| Etcd | 1.55ms | 19.53ms | 5227.69 |
| Gryadka | 1.68ms | 28.53ms | 4720.19 |
