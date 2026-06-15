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
  npm i

  cd "$ROOT_DIR" || exit 1
fi

# Setup Skia WASM
echo -e "\n${GREEN}Setting up Skia WASM!${NC}"
npx setup-skia-web

# Clean up web/static created by setup-skia-web
rm -rf "$ROOT_DIR/web/static"

# Remove the nested metro-source-map that @rock-js/plugin-metro may bundle, so the
# patched top-level metro-source-map (patches/metro-source-map+0.84.4.patch) is the
# only copy resolved. Without this, Rock can load its own unpatched copy and the
# Hermes "__packed" source map crash ("Unexpected module with full source map found")
# can come back.
rm -rf "$ROOT_DIR/node_modules/@rock-js/plugin-metro/node_modules/metro-source-map"

# Apply packages using patch-package
scripts/applyPatches.sh
