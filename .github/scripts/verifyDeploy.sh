#!/bin/bash

URL="$1"
EXPECTED_VERSION="$2"

sleep 5
ATTEMPT=0
MAX_ATTEMPTS=10
while [[ $ATTEMPT -lt $MAX_ATTEMPTS ]]; do
  ((ATTEMPT++))

  echo "Attempt $ATTEMPT: Checking deployed version..."
  DOWNLOADED_VERSION="$(wget -q -O /dev/stdout "$URL"/version.json | jq -r '.version')"

  if [[ "$EXPECTED_VERSION" == "$DOWNLOADED_VERSION" ]]; then
    echo "Success: Deployed version matches local version: $DOWNLOADED_VERSION"
    exit 0
  fi

  if [[ $ATTEMPT -lt $MAX_ATTEMPTS ]]; then
    echo "Version mismatch, found $DOWNLOADED_VERSION. Retrying in 5 seconds..."
    sleep 5
  fi
done

echo "Error: Deployed version did not match local version after $MAX_ATTEMPTS attempts. Something went wrong..."
exit 1
