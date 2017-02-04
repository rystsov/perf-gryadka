**Cloud**: Azure / East US

**Etcd nodes:** 3 x Standard DS12 v2

**Client node:** 1 x Standard DS12 v2

| hdparm -Tt /dev/sdb1 |
| --- |
| Timing cached reads:   18842 MB in  2.00 seconds = 9429.78 MB/sec |
| Timing buffered disk reads: 394 MB in  3.01 seconds = 130.76 MB/sec |

wrk -t8 -c8 -s benchmarks/cycles.lua -d10m http://10.0.0.5:2379

| Thread Stats | Avg | Stdev | Max | +/- Stdev |
| --- | --- | --- | --- | --- |
| Latency | 1.55ms | 679.05us | 19.53ms | 94.81% |
| Req/Sec | 656.54 | 46.61 | 797.00 | 73.12% |

Requests/sec:   5227.69