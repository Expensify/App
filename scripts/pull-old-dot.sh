#!/bin/bash
set -e

YELLOW='\033[1;33m'
NC='\033[0m'

# Go to NewDot project root
ROOT_DIR=$(dirname "$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &> /dev/null && pwd)")
cd "$ROOT_DIR" || exit 1

# See if we're in the HybridApp repo
IS_HYBRID_APP_REPO=$(scripts/is-hybrid-app-repo.sh)

if [[ "$IS_HYBRID_APP_REPO" == "true" ]]; then
    echo "We're in HybridApp. Performing git pull."

    # Navigate to the OldDot repository
    cd ..

    # Perform git pull, and run npm install
    git pull
    npm i
else
    echo -e "${YELLOW}[WARNING] We're not in Mobile-Expensify repo, nothing to pull. Are you sure you should be here?${NC}"
fi
