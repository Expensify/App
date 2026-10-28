#!/usr/bin/env bash
# cspell:ignore chrispader
set -euo pipefail

# Push the pinned native revision first so the App push can start CI immediately.
branch='@chrispader/perf/pgo-ci-app-evaluation'
repository=$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)
temporary=$(mktemp -d)
trap 'rm -rf "$temporary"' EXIT

app_sha=$(git -C "$repository" rev-parse HEAD)
mobile_sha=$(git -C "$repository" ls-tree HEAD Mobile-Expensify | awk '{print $3}')
test -n "$mobile_sha" || { echo 'Run this script from the combined PGO PR branch.' >&2; exit 1; }

git init --quiet --bare "$temporary/native.git"
git -C "$temporary/native.git" fetch --no-tags git@github.com:margelo/Mobile-Expensify.git "$mobile_sha"
test "$(git -C "$temporary/native.git" rev-parse FETCH_HEAD)" = "$mobile_sha"
git -C "$temporary/native.git" push git@github.com:Expensify/Mobile-Expensify.git "FETCH_HEAD:refs/heads/$branch"
git -C "$repository" push git@github.com:Expensify/App.git "$app_sha:refs/heads/$branch"

echo 'Open Expensify/App > Actions > Evaluate native PGO on emulators to see the run.'
