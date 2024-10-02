#!/bin/bash
set -e

ROOT_DIR=$(dirname "$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &> /dev/null && pwd)")
cd "$ROOT_DIR" || exit 1

# See if we're in the HybridApp repo
IS_HYBRID_APP_REPO=$(scripts/is-hybrid-app-repo.sh)

if [[ "$IS_HYBRID_APP_REPO" == "true" && "$1" != "--new-dot" ]]; then
    # Navigate to the OldDot repository, and clean
    cd ..
    npm run clean
else
    # Clean NewDot
    npx react-native clean-project-auto
fi
