#!/bin/bash
# a script that sets Pusher room suffix (for internal usage)

# config file to be parsed for the suffix (relative to current project root)
CONFIG_FILE="../Web-Expensify/_config.local.php"

if [ -f '.env' ]; then
    while read -r line; do
        if [[ "$line" == \#* ]]; then
            continue
        fi
        export "${line?}"
    done < .env
fi

# use the suffix only when the config file can be found
if [ -f "$CONFIG_FILE" ]; then
    # If we are pointing to the staging or production api don't add the suffix
    if [[ $EXPENSIFY_URL == "https://www.expensify.com/" ]]; then
        echo "Ignoring the PUSHER_DEV_SUFFIX since we are not pointing to the dev API"
        exit 0
    fi

    echo "Using PUSHER_DEV_SUFFIX from $CONFIG_FILE"

    PATTERN="PUSHER_DEV_SUFFIX.*'(.+)'"
    while read -r line; do
      if [[ $line =~ $PATTERN ]]; then
        PUSHER_DEV_SUFFIX=${BASH_REMATCH[1]}
        echo "Found suffix: $PUSHER_DEV_SUFFIX"
        echo "Updating .env"

        # delete any old suffix value and append the new one
        sed -i '' '/^PUSHER_DEV_SUFFIX/d' '.env' || true
        # a dash '-' is prepended to separate the suffix from trailing channel IDs (accountID, reportID, etc).
        echo "PUSHER_DEV_SUFFIX=-${PUSHER_DEV_SUFFIX}" >> .env
      fi
    done < "$CONFIG_FILE"
fi
