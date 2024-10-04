#!/bin/bash

# Exit immediately if any command exits with a non-zero status
set -e

BLUE='\033[1;34m'
NC='\033[0m'

# Go to NewDot project root
ROOT_DIR=$(dirname "$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &> /dev/null && pwd)")
cd "$ROOT_DIR" || exit 1

# Apply packages using patch-package
scripts/applyPatches.sh

IS_HYBRID_APP_REPO=$(scripts/is-hybrid-app-repo.sh)

if [[ "$IS_HYBRID_APP_REPO" == "true" ]]; then
    echo -e "${BLUE}Applying patches to OldDot...${NC}"

    # Apply HybridApp-specific patches to NewDot
    npx patch-package --patch-dir '../patches/new-dot'
fi

# Install node_modules in subpackages, unless we're in a CI/CD environment,
# where the node_modules for subpackages are cached separately.
# See `.github/actions/composite/setupNode/action.yml` for more context.
if [[ -z ${CI+x} ]]; then
  scripts/check-for-old-dot-changes.sh

  cd desktop || exit 1
  npm install
fi
