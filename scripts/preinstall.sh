#!/bin/bash
set -e

BLUE='\033[1;34m'
NC='\033[0m'

# Go to NewDot project root
ROOT_DIR=$(dirname "$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &> /dev/null && pwd)")
cd "$ROOT_DIR" || exit 1

# See if we're in the HybridApp repo
IS_HYBRID_APP_REPO=$(scripts/is-hybrid-app-repo.sh)

if [[ "$IS_HYBRID_APP_REPO" == "true" ]]; then
    echo "${BLUE}We're in HybridApp. Executing npm install for OldDot.${NC}"

    # Navigate to the OldDot repository
    cd ..

    # Perform npm install in OldDot
    npm i
fi
