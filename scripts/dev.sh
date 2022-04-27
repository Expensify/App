#!/bin/bash
# local development start script to prepare dev related env

SCRIPTS_DIR=$(dirname "${BASH_SOURCE[0]}")

source "$SCRIPTS_DIR/shellUtils.sh"
bash "$SCRIPTS_DIR/set-pusher-suffix.sh"
