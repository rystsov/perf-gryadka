"""Empty module docstring"""

from sys import argv

import json
from lib import measures

def dump_channels(channels, path):
    """missing function docstring"""
    for key in channels.keys():
        with open(path + "/" + key, "w") as output:
            for item in channels[key]:
                tick_ms = int(item["begin"] / 1000000)
                latency_us = int(item["latency"] / 1000)
                record = "" + str(tick_ms) + "\t" + str(latency_us) + "\n"
                output.write(record)

def dump_stat(channels, path):
    """missing function docstring"""
    with open(path + "/stat.json", "w") as output:
        json.dump(channels, output, sort_keys=True, indent=4, separators=(',', ': '))

print(argv)

data = measures.load(argv[1])
stat = measures.stat(data)
dump_channels(data, argv[2])
dump_stat(stat, argv[2])
