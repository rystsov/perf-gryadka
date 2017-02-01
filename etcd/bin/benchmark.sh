#!/bin/bash

wrk -t8 -c8 -s benchmarks/cycles.lua -d10m http://10.0.0.5:2379
