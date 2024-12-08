#!/bin/bash
set -e

export PROJECT_ROOT_PATH

BUILD="$1"
NEW_DOT_FLAG="false"
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

# Assign the arguments to variables
if [ "$#" -eq 1 ]; then
    BUILD="$1"
elif [ "$#" -eq 2 ]; then
    if [ "$1" == "--new-dot" ]; then
        BUILD="$2"      
        NEW_DOT_FLAG="true"
    elif [ "$2" == "--new-dot" ]; then
        BUILD="$1"
        NEW_DOT_FLAG="true"
    else
        print_error_and_exit
    fi
else
    print_error_and_exit
fi

# See if we're in the HybridApp repo
IS_HYBRID_APP_REPO=$(scripts/is-hybrid-app.sh)

 if [[ "$IS_HYBRID_APP_REPO" == "true" && "$NEW_DOT_FLAG" == "false" ]]; then
    # Set HybridApp-specific arguments
    IOS_MODE="Debug"
    ANDROID_MODE="Debug"
    SCHEME="Expensify"
    APP_ID="org.me.mobiexpensifyg"

    echo -e "\n${GREEN}Starting a HybridApp build!${NC}"
    PROJECT_ROOT_PATH="Mobile-Expensify/"
    export CUSTOM_APK_NAME="Expensify-debug.apk"
else
    echo -e "\n${GREEN}Starting a standalone NewDot build!${NC}"
    echo $ANDROID_MODE
    PROJECT_ROOT_PATH="./"
    unset CUSTOM_APK_NAME
fi

# Check if the argument is one of the desired values
case "$BUILD" in
    --ios)
        npx react-native run-ios --list-devices --mode $IOS_MODE --scheme "$SCHEME"
        ;;
    --ipad)
        npx react-native run-ios --simulator "iPad Pro (12.9-inch) (6th generation)" --mode $IOS_MODE --scheme "$SCHEME"
        ;;
    --ipad-sm)
        npx react-native run-ios --simulator "iPad Pro (11-inch) (4th generation)" --mode $IOS_MODE --scheme "$SCHEME"
        ;;
    --android)
        npx react-native run-android --mode $ANDROID_MODE --appId $APP_ID --active-arch-only
        ;;
    *)
        print_error_and_exit
        ;;
esac
