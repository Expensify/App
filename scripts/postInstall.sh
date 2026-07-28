#!/bin/bash

# Exit immediately if any command exits with a non-zero status
set -e

# Go to project root
ROOT_DIR=$(dirname "$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &> /dev/null && pwd)")
cd "$ROOT_DIR" || exit 1

# See if we're in the HybridApp repo
IS_HYBRID_APP_REPO=$(scripts/is-hybrid-app.sh)

# See if we should force standalone NewDot build
NEW_DOT_FLAG="${STANDALONE_NEW_DOT:-false}"

if [[ "$IS_HYBRID_APP_REPO" == "true" && "$NEW_DOT_FLAG" == "false" ]]; then
  echo -e "\n${GREEN}Installing node modules in Mobile-Expensify submodule!${NC}"
  cd Mobile-Expensify || exit 1
  # The Mobile-Expensify submodule is a separate repo that still uses npm (its own package-lock.json,
  # engine-strict .npmrc, and dependency lifecycle scripts). Keep installing it with npm here until it
  # is migrated to bun in its own repo.
  npm i

  cd "$ROOT_DIR" || exit 1
fi

# Setup Skia WASM
echo -e "\n${GREEN}Setting up Skia WASM!${NC}"
bunx setup-skia-web

# Clean up web/static created by setup-skia-web
rm -rf "$ROOT_DIR/web/static"

# Apply packages using patch-package
scripts/applyPatches.sh

# Bun's hoisted linker installs workspace dependencies into the root node_modules but still leaves
# symlinks in each workspace's node_modules pointing at a per-workspace store path that hoisted mode
# never creates. Those dangling links shadow the hoisted root copies and break module resolution
# (e.g. `import pixelmatch` from server/victory-chart-renderer). Remove any broken links so resolution
# falls back to the root node_modules.
for workspace_modules in server/*/node_modules; do
  [[ -d "$workspace_modules" ]] || continue
  find "$workspace_modules" -maxdepth 2 -type l | while read -r link; do
    [[ -e "$link" ]] || rm -f "$link"
  done
done
