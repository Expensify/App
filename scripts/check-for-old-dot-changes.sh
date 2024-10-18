#!/bin/bash
set -e

# Go to NewDot project root
ROOT_DIR=$(dirname "$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &> /dev/null && pwd)")
cd "$ROOT_DIR" || exit 1

# See if we're in the HybridApp repo
IS_HYBRID_APP_REPO=$(scripts/is-hybrid-app-repo.sh)

GREEN='\033[1;32m'
YELLOW='\033[1;33m'
RED='\033[1;31m'
NC='\033[0m'

if [[ "$IS_HYBRID_APP_REPO" == "true" ]]; then
    # Navigate to the OldDot repository
    cd ..

    # Fetch the latest changes from the OldDot repository
    git fetch

    # Count the number of commits behind
    UPSTREAM=${1:-'@{u}'}
    COMMITS_BEHIND=$(git rev-list --count HEAD.."$UPSTREAM")

    if [[ $COMMITS_BEHIND -eq 0 ]]; then
        echo -e "\n${GREEN}OldDot repository is up to date!${NC}"
    else
        echo -e "\n${YELLOW}[WARNING] You are ${RED}$COMMITS_BEHIND commit(s)${YELLOW} behind on the OldDot repo. Consider executing ${RED}npm run pull-old-dot${NC}"
    fi
fi
