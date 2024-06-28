#!/bin/bash

# Exit immediately if any command exits with a non-zero status
set -e

# Go to project root
ROOT_DIR=$(dirname "$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &> /dev/null && pwd)")
cd "$ROOT_DIR" || exit 1

# Apply packages using patch-package
scripts/applyPatches.sh

# Install node_modules in subpackages, unless we're in a CI/CD environment,
# where the node_modules for subpackages are cached separately.
# See `.github/actions/composite/setupNode/action.yml` for more context.
if [[ -z ${CI+x} ]]; then
  cd desktop || exit 1
  npm install
fi
