#!/bin/bash

mkdir -p deployment/etcd

./etcd-v3.1.0/etcd \
  --name etcd3 \
  --initial-advertise-peer-urls http://10.0.0.9:2380 \
  --listen-peer-urls http://10.0.0.9:2380 \
  --listen-client-urls http://10.0.0.9:2379,http://127.0.0.1:2379 \
  --advertise-client-urls http://10.0.0.9:2379 \
  --initial-cluster-token etcd-cluster-1 \
  --initial-cluster etcd1=http://10.0.0.5:2380,etcd2=http://10.0.0.6:2380,etcd3=http://10.0.0.9:2380 \
  --initial-cluster-state new