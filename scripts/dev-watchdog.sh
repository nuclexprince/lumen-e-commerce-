#!/bin/bash
# Watchdog: keep next dev running on port 3000
cd /home/z/my-project
while true; do
  # check if something is listening on 3000 and responding
  if ! curl -s -o /dev/null -m 3 http://localhost:3000/ 2>/dev/null; then
    echo "[$(date +%H:%M:%S)] port 3000 not responding, starting next dev..." >> watchdog.log
    pkill -9 -f "next dev" 2>/dev/null
    pkill -9 -f "next-server" 2>/dev/null
    sleep 1
    nohup ./node_modules/.bin/next dev -p 3000 > dev.log 2>&1 &
    NEXT_PID=$!
    echo "[$(date +%H:%M:%S)] started next dev pid=$NEXT_PID" >> watchdog.log
    # wait for it to come up
    for i in $(seq 1 20); do
      sleep 2
      if curl -s -o /dev/null -m 3 http://localhost:3000/ 2>/dev/null; then
        echo "[$(date +%H:%M:%S)] next dev is responding" >> watchdog.log
        break
      fi
    done
  fi
  sleep 15
done
