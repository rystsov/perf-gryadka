**Cloud**: Azure / East US

**Data nodes:** 3 x Standard DS12 v2

**Client node:** 1 x Standard DS12 v2

| hdparm -Tt /dev/sdb1 |
| --- |
| Timing cached reads:   18842 MB in  2.00 seconds = 9429.78 MB/sec |
| Timing buffered disk reads: 394 MB in  3.01 seconds = 130.76 MB/sec |

## Etcd

wrk -t8 -c8 -s benchmarks/cycles.lua -d10m http://10.0.0.4:2379

| Thread Stats | Avg | Max |
| --- | --- | --- |
| Latency | 1.55ms | 19.53ms |

Requests/sec:   5227.69

## Gryadka

./bin/benchmark.sh -c 8 -d 10m http://10.0.0.4:2379

| Thread Stats | Avg | Max |
| --- | --- | --- |
| Latency | 1.68ms | 28.53ms |

Requests/sec: 4720.19
