#!/bin/bash
set -e

BLUE='\033[1;34m'
NC='\033[0m'

# See if we're in the HybridApp repo
IS_HYBRID_APP_REPO=$(scripts/is-hybrid-app.sh)

if [[ "$IS_HYBRID_APP_REPO" == "true" && "$1" != "--new-dot" ]]; then
    echo -e "${BLUE}Cleaning HybridApp project...${NC}"
    # Navigate to Mobile-Expensify repository, and clean
    cd Mobile-Expensify
    npm run clean -- "$@"
else
    # Clean NewDot
    echo -e "${BLUE}Cleaning standalone NewDot project...${NC}"
    npx react-native clean-project-auto
fi
