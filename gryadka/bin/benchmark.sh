#!/bin/bash

set -e

node-nightly --harmony src/benchmark.js $@
