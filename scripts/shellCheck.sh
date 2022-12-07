#!/bin/bash

CURRENT_DIR=$(pwd)
ROOT_DIR=$(dirname "$(dirname "$(realpath "${BASH_SOURCE[0]}")")")

cd "$ROOT_DIR" || exit 1

# This lists all shell scripts in this repo except those in directories we want to ignore
SHELL_SCRIPTS=$(find . -type d \( -path ./node_modules -o -path ./vendor -o -path ./ios/Pods \) -prune -o -name '*.sh' -print)

declare ASYNC_PROCESSES=()
for SHELL_SCRIPT in $SHELL_SCRIPTS; do
  npx shellcheck "$SHELL_SCRIPT" &
  ASYNC_PROCESSES+=($!)
done

for PID in "${ASYNC_PROCESSES[@]}"; do
  wait "$PID"
done

cd "$CURRENT_DIR" || exit 1
