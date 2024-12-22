#!/bin/bash
set -e

BLUE='\033[1;34m'
NC='\033[0m'

# See if we're in the HybridApp repo
IS_HYBRID_APP_REPO=$(scripts/is-hybrid-app.sh)

# See if we should force standalone NewDot build
NEW_DOT_FLAG="${STANDALONE_NEW_DOT:-false}"

if [[ "$IS_HYBRID_APP_REPO" == "true" && "$NEW_DOT_FLAG" == "false" ]]; then
    echo -e "${BLUE}Cleaning HybridApp project...${NC}"
    # Navigate to Mobile-Expensify repository, and clean
    cd Mobile-Expensify
    npm run clean -- "$@"
else
    # Clean NewDot
    echo -e "${BLUE}Cleaning standalone NewDot project...${NC}"
    npx react-native clean-project-auto
fi
