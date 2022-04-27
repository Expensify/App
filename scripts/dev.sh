#!/bin/bash
# local development start script to prepare dev related env

SCRIPTS_DIR=$(dirname "${BASH_SOURCE[0]}")

bash "$SCRIPTS_DIR/set-pusher-suffix.sh"
