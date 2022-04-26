#!/bin/bash
# local development start script
# prepares dev related env and runs the given command

SCRIPTS_DIR=$(dirname "${BASH_SOURCE[0]}")

source "$SCRIPTS_DIR/shellUtils.sh"
source "$SCRIPTS_DIR/set-pusher-suffix.sh"

# accepts the next command to be executed as a parameter
# environment variables defined in previous steps are passed down
exec "$@"
