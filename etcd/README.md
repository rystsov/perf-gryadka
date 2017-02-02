East US
3 x Standard DS12 v2 x3
1 x Standard DS1 v2

hdparm -Tt /dev/sdb1

/dev/sdb1:
 Timing cached reads:   18842 MB in  2.00 seconds = 9429.78 MB/sec
 Timing buffered disk reads: 394 MB in  3.01 seconds = 130.76 MB/sec

Running 10m test @ http://10.0.0.5:2379
  8 threads and 8 connections
  Thread Stats   Avg      Stdev     Max   +/- Stdev
    Latency     0.93ms  807.58us  66.63ms   93.80%
    Req/Sec     1.14k    86.49     1.40k    73.51%
  5457536 requests in 10.00m, 1.80GB read
  Non-2xx or 3xx responses: 8
Requests/sec:   9094.57
Transfer/sec:      3.07MB