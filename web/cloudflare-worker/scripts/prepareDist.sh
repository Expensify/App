#!/bin/bash
# Wrangler only reads .assetsignore from the root of the assets directory, which the web build recreates.
set -eu

WORKER_DIR="$(cd "$(dirname "$0")/.." && pwd)"
DIST_DIR="$WORKER_DIR/../../dist"

# `wrangler types` also runs this build step, and needs no web build. Without one, dev and deploy fail on the missing assets directory.
if [[ ! -d "$DIST_DIR" ]]; then
    exit 0
fi

cp "$WORKER_DIR/.assetsignore" "$DIST_DIR/.assetsignore"
