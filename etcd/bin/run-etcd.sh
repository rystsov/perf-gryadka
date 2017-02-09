#!/bin/bash

cluster=$(cat etc/cluster.json | jq -r 'to_entries | map ("\(.key)=http://\(.value.host):\(.value.peerPort)") | join(",")')
peer=$(cat etc/cluster.json | jq -r "\"http://\(.$1.host):\(.$1.peerPort)\"")
client=$(cat etc/cluster.json | jq -r "\"http://\(.$1.host):\(.$1.clientPort)\"")

mkdir -p deployment/etcd

./etcd-v3.1.0/etcd \
  --name $1 \
  --initial-advertise-peer-urls $peer \
  --listen-peer-urls $peer \
  --listen-client-urls $client \
  --advertise-client-urls $client \
  --initial-cluster-token etcd-cluster-1 \
  --initial-cluster "$cluster" \
  --initial-cluster-state new
