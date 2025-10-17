#!/bin/bash
set -e

if [ -f .env ]; then
    set -a
    source .env
    set +a
fi

IOS_MODE="DebugDevelopment"
ANDROID_MODE="developmentDebug"
SCHEME="New Expensify Dev"
APP_ID="com.expensify.chat.dev"

GREEN='\033[1;32m'
RED='\033[1;31m'
NC='\033[0m'

# Function to print error message and exit
function print_error_and_exit {
    echo -e "${RED}Error: Invalid invocation. Please use one of: [ios, ipad, ipad-sm, android].${NC}"
    exit 1
}

# Assign the arguments to variables if arguments are correct
if [ "$#" -ne 1 ] || [[ "$1" != "--ios" && "$1" != "--ipad" && "$1" != "--ipad-sm" && "$1" != "--android" ]]; then
    print_error_and_exit
fi

BUILD="$1"

# See if we're in the HybridApp repo
IS_HYBRID_APP_REPO=$(scripts/is-hybrid-app.sh)

# See if we should force standalone NewDot build
NEW_DOT_FLAG="${STANDALONE_NEW_DOT:-false}"

 if [[ "$IS_HYBRID_APP_REPO" == "true" && "$NEW_DOT_FLAG" == "false" ]]; then
    # Set HybridApp-specific arguments
    IOS_MODE="Debug"
    ANDROID_MODE="Debug"
    SCHEME="Expensify Dev"
    APP_ID="org.me.mobiexpensifyg.dev"

    # Build Yapl JS
    cd Mobile-Expensify && npm run grunt:build:shared && cd ..

    echo -e "\n${GREEN}Starting a HybridApp build!${NC}"
    export CUSTOM_APK_NAME="Expensify-debug.apk"
    export IS_HYBRID_APP="true"
else
    echo -e "\n${GREEN}Starting a standalone NewDot build!${NC}"
    echo $ANDROID_MODE
    unset CUSTOM_APK_NAME
fi

# Check if the argument is one of the desired values
case "$BUILD" in
    --ios)
        npx rock run:ios --configuration $IOS_MODE --scheme "$SCHEME"
        ;;
    --ipad)
        npx rock run:ios --simulator "iPad Pro (12.9-inch) (6th generation)" --configuration $IOS_MODE --scheme "$SCHEME"
        ;;
    --ipad-sm)
        npx rock run:ios --simulator "iPad Pro (11-inch) (4th generation)" --configuration $IOS_MODE --scheme "$SCHEME"
        ;;
    --android)
        npx rock run:android --variant $ANDROID_MODE --app-id $APP_ID --active-arch-only --verbose
        ;;
    *)
        print_error_and_exit
        ;;
esac
