#!/bin/bash

set -e

node-nightly --harmony src/benchmark.js -c 8 -d 10m
