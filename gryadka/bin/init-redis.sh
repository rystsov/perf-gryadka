#!/bin/bash

set -e

mkdir -p deployment/$1
node src/redis-conf.js $1 $(pwd)/deployment/$1

port=$(cat etc/settings.json | jq ".acceptors.$1.storage.port")
host=$(cat etc/settings.json | jq ".acceptors.$1.storage.host")
echo $port
echo $(cat node_modules/gryadka/src/lua/accept.lua)

redis-server deployment/$1/redis.conf &
PID=$!
# I don't have an excuse for sleep
sleep 1
redis-cli -h $host -p $port SCRIPT LOAD "$(cat node_modules/gryadka/src/lua/accept.lua)" > deployment/$1/accept.hash
redis-cli -h $host -p $port SCRIPT LOAD "$(cat node_modules/gryadka/src/lua/prepare.lua)" > deployment/$1/prepare.hash
kill $PID
