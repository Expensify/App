#!/bin/bash
# a script that sets Pusher room suffix (for internal usage)

# local config to be parsed for the suffix
CONFIG_FILE=${1:-"../Web-Expensify/_config.local.php"}

# use the suffix only when the file can be found
if [ -f "$CONFIG_FILE" ]; then
    echo "Using PUSHER_DEV_SUFFIX from $CONFIG_FILE"

    PATTERN="PUSHER_DEV_SUFFIX.*'(.+)'"
    while read -r line; do
      if [[ $line =~ $PATTERN ]]; then
        export PUSHER_DEV_SUFFIX=${BASH_REMATCH[1]}
        echo "Found suffix: $PUSHER_DEV_SUFFIX"
      fi
    done < "$CONFIG_FILE"
fi
