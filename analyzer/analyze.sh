#!/bin/bash

rm -rf report
mkdir report

python analyze.py $1 "report"
