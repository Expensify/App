#!/bin/bash
# a script that sets Pusher room suffix (for internal usage)

# config file to be parsed for the suffix (relative to current project root)
CONFIG_FILE="../Web-Expensify/_config.local.php"

# use the suffix only when the config file can be found
if [ -f "$CONFIG_FILE" ]; then
    echo "Using PUSHER_DEV_SUFFIX from $CONFIG_FILE"

    PATTERN="PUSHER_DEV_SUFFIX.*'(.+)'"
    while read -r line; do
      if [[ $line =~ $PATTERN ]]; then
        PUSHER_DEV_SUFFIX=${BASH_REMATCH[1]}
        echo "Found suffix: $PUSHER_DEV_SUFFIX"
        echo "Updating .env"

        # delete any old suffix value and append the new one
        sed -i '' '/^PUSHER_DEV_SUFFIX/d' '.env' || true
        echo "PUSHER_DEV_SUFFIX=-${PUSHER_DEV_SUFFIX}" >> .env

      fi
    done < "$CONFIG_FILE"
fi
