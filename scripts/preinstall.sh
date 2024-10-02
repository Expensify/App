#!/bin/bash
set -e

# Go to NewDot project root
ROOT_DIR=$(dirname "$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &> /dev/null && pwd)")
cd "$ROOT_DIR" || exit 1

# See if we're in the HybridApp repo
IS_HYBRID_APP_REPO=$(scripts/is-hybrid-app-repo.sh)

if [[ "$IS_HYBRID_APP_REPO" == "true" ]]; then
    echo "We're in HybridApp. Executing npm install."

    # Navigate to the OldDot repository
    cd ..

    # Perform npm install in OldDot
    npm i
fi
