#!/bin/bash

# This script injects CI data into src/CONST/CI.ts so the JS bundle
# carries the correct values even when native builds are cached/reused.
#
# Usage: ./.github/scripts/inject-ci-data.sh KEY=VALUE [KEY=VALUE ...]
#
# Examples:
#   ./.github/scripts/inject-ci-data.sh PULL_REQUEST_NUMBER=12345
#   ./.github/scripts/inject-ci-data.sh PULL_REQUEST_NUMBER=12345 SOME_OTHER=value
#
# - If no arguments are provided, exits 0 (no crash).
# - If CI.ts is not found, logs a warning and exits 0 (no crash).
# - Values must be alphanumeric (plus hyphens, underscores, dots) for safety.
# - Each KEY must have a matching "const KEY = '...'" line in CI.ts.

set -euo pipefail

CI_FILE="src/CONST/CI.ts"

echo "[inject-ci-data] Injecting CI data into $CI_FILE"

if [ "$#" -eq 0 ]; then
    echo "[inject-ci-data] No arguments provided. Skipping injection."
    exit 0
fi

if [ ! -f "$CI_FILE" ]; then
    echo "[inject-ci-data] ⚠️ $CI_FILE not found. Skipping injection."
    exit 0
fi

for ARG in "$@"; do
    if [[ "$ARG" != *"="* ]]; then
        echo "[inject-ci-data] ⚠️ Invalid argument '$ARG'. Expected KEY=VALUE format. Skipping."
        continue
    fi

    KEY="${ARG%%=*}"
    VALUE="${ARG#*=}"

    if [ -z "$KEY" ]; then
        echo "[inject-ci-data] ⚠️ Empty key in '$ARG'. Skipping."
        continue
    fi

    if [ -z "$VALUE" ]; then
        echo "[inject-ci-data] No value for '$KEY'. Skipping."
        continue
    fi

    if ! [[ "$VALUE" =~ ^[a-zA-Z0-9._-]+$ ]]; then
        echo "[inject-ci-data] ⚠️ Value '$VALUE' for key '$KEY' contains invalid characters. Skipping."
        continue
    fi

    BEFORE=$(grep "const ${KEY} " "$CI_FILE" || true)

    if [ -z "$BEFORE" ]; then
        echo "[inject-ci-data] ⚠️ Could not find 'const ${KEY}' in $CI_FILE. Skipping."
        continue
    fi

    # Works on both GNU sed (Linux/CI) and BSD sed (macOS) by using a backup
    # extension and then removing the backup file.
    sed -i.bak "s/const ${KEY} = '.*'/const ${KEY} = '${VALUE}'/" "$CI_FILE"
    rm -f "${CI_FILE}.bak"

    AFTER=$(grep "const ${KEY} " "$CI_FILE" || true)
    echo "[inject-ci-data] ✅ Injection for $KEY successful:  $AFTER"
done

echo "[inject-ci-data] Done."
