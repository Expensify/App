#!/bin/bash
# Wrangler only reads .assetsignore from the root of the assets directory, which the web build recreates.
set -eu

WORKER_DIR="$(cd "$(dirname "$0")/.." && pwd)"
DIST_DIR="$WORKER_DIR/../../dist"

if [[ ! -f "$DIST_DIR/index.html" ]]; then
    echo "No web build found at $DIST_DIR. Build one first (see README.md)." >&2
    exit 1
fi

cp "$WORKER_DIR/.assetsignore" "$DIST_DIR/.assetsignore"
