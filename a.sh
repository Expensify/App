#!/bin/bash
set -e

while true; do
  log="$HOME/.npm/_logs/`ls $HOME/.npm/_logs/ | tail -n 1`"
  echo "log: $log"
  for path in `cat "$log" | grep 'ENOTEMPTY' | grep -oE "[^']+node_modules[^']+"`; do
    echo "removing $path"
    rm -rf "$path"
  done
  if npm install; then
    break
  fi
done