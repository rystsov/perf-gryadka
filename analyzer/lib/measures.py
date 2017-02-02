"""Empty module docstring"""

import re
from collections import defaultdict

OPEN = re.compile(r"^(\d+) (\d+) \[ ([^ ]+) ([^ ]+) ([^\n]+)$")
CLOSE = re.compile(r"^(\d+) (\d+) \] ([^\n]+)$")

def _get_measures(path):
    """missing function docstring"""
    opened = dict()
    measures = []
    with open(path, "r") as log:
        for line in log:
            match = OPEN.match(line)
            if match:
                timestamp = int(match.group(1))
                mid = int(match.group(2))
                _cid = match.group(3)
                channel = match.group(4)
                _key = match.group(5)
                if mid in opened:
                    raise Exception()
                opened[mid] = {
                    "ts": timestamp,
                    "channel": channel
                }
                continue
            match = CLOSE.match(line)
            if match:
                timestamp = int(match.group(1))
                mid = int(match.group(2))
                status = match.group(3)
                if mid not in opened:
                    raise Exception()
                measures.append({
                    "begin": opened[mid]["ts"],
                    "latency": (timestamp - opened[mid]["ts"]),
                    "channel": opened[mid]["channel"],
                    "status": status
                })
                continue
    return measures

def _normalise(measures):
    """missing function docstring"""
    normalized = []
    minimum = min(map(lambda x: x["begin"], measures))
    for item in measures:
        normalized.append({
            "begin": (item["begin"] - minimum),
            "latency": item["latency"],
            "channel": item["channel"],
            "status": item["status"]
        })
    return normalized

def _channelize(measures):
    """missing function docstring"""
    channels = defaultdict(lambda: [])
    for item in measures:
        key = item["channel"] + "." + item["status"]
        channels[key].append({
            "begin": item["begin"],
            "latency": item["latency"]
        })
    return channels

def load(path):
    """missing function docstring"""
    data = _get_measures(path)
    data = _normalise(data)
    data = _channelize(data)
    return data

def stat(channels):
    """missing function docstring"""
    def stat_channel(channel):
        """missing function docstring"""
        latency = map(lambda x: x["latency"], channel)
        latency = sorted(latency)
        acc = sum(latency)
        size = len(latency)
        mean_ns = float(acc) / size
        median_ns = latency[int(size / 2)]
        p90_ns = latency[int(0.90 * size)]
        p99_ns = latency[int(0.99 * size)]
        minimum_ns = min(latency)
        maximum_ns = max(latency)
        return {
            "count": size,
            "mean_us": int(mean_ns / 1000),
            "median_us": int(median_ns / 1000),
            "p90_us": int(p90_ns / 1000),
            "p99_us": int(p99_ns / 1000),
            "minimum_us": int(minimum_ns / 1000),
            "maximum_us": int(maximum_ns / 1000),
        }
    result = dict()
    for key in channels.keys():
        result[key] = stat_channel(channels[key])
    return result
