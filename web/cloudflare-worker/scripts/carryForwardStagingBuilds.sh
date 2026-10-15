#!/bin/bash
# Downloads the web builds of the last N staging releases and carries their files forward into dist/, so tabs still
# running one of those builds can load its chunks after this deploy. Needs `gh` with read access to Expensify/App.
set -euo pipefail

if [[ $# -ne 1 ]]; then
    echo "Usage: $0 <number of staging releases>" >&2
    exit 1
fi

RELEASE_COUNT="$1"
WORKER_DIR="$(cd "$(dirname "$0")/.." && pwd)"
DIST_DIR="$WORKER_DIR/../../dist"
# A retried deploy, or one whose release is published while this runs, would otherwise count its own release.
CURRENT_TAG="$(jq -r .version "$DIST_DIR/version.json")-staging"
DOWNLOAD_DIR="$(mktemp -d)"
trap 'rm -rf "$DOWNLOAD_DIR"' EXIT

PREVIOUS_BUILDS=()
while read -r TAG; do
    mkdir -p "$DOWNLOAD_DIR/$TAG"
    if gh release download "$TAG" --repo Expensify/App --pattern webBuild.tar.gz --output - | tar -xz -C "$DOWNLOAD_DIR/$TAG"; then
        PREVIOUS_BUILDS+=("$DOWNLOAD_DIR/$TAG/dist")
    else
        echo "::warning::Could not download the web build from release $TAG, so its files are not carried forward."
    fi
done < <(gh release list --repo Expensify/App --exclude-drafts --limit 50 --json tagName \
    --jq "[.[] | select((.tagName | test(\"-staging$\")) and .tagName != \"$CURRENT_TAG\")][:$RELEASE_COUNT][].tagName")

if [[ ${#PREVIOUS_BUILDS[@]} -eq 0 ]]; then
    echo "::warning::No previous staging builds were downloaded, so open tabs may fail to load chunks after this deploy."
    exit 0
fi

node "$WORKER_DIR/scripts/carryForwardPreviousBuilds.ts" "$DIST_DIR" "${PREVIOUS_BUILDS[@]}"
