#!/bin/bash
# Watchdog: relaunch gen-images until all 23 images exist or max attempts reached
cd /home/z/my-project
ATTEMPTS=0
MAX=12
while [ $ATTEMPTS -lt $MAX ]; do
  ATTEMPTS=$((ATTEMPTS+1))
  # count valid images (>3KB)
  COUNT=$(find public/products public/categories public/editorial public/brand -type f -size +3k 2>/dev/null | wc -l)
  echo "[watchdog attempt=$ATTEMPTS] have=$COUNT/23"
  if [ "$COUNT" -ge 23 ]; then echo "ALL_IMAGES_READY"; break; fi
  bun scripts/gen-images.mjs >> scripts/gen.log 2>&1
  sleep 3
done
echo "[watchdog] finished after $ATTEMPTS attempts"
