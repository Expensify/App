#!/bin/bash
set -e

# Get the directory where this script lives
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Source shellUtils for helper functions
source "${SCRIPT_DIR}/shellUtils.sh"

if [ -f .env ]; then
    set -a
    source .env
    set +a
fi

IOS_MODE="DebugDevelopment"
ANDROID_MODE="developmentDebug"
SCHEME="New Expensify Dev"
APP_ID="com.expensify.chat.dev"

# Function to print error message and exit
function print_error_and_exit {
    error "Invalid invocation. Please use one of: [ios, ipad, ipad-sm, android]."
    exit 1
}

# Parse arguments
if [ "$#" -lt 1 ] || [[ "$1" != "--ios" && "$1" != "--ipad" && "$1" != "--ipad-sm" && "$1" != "--android" ]]; then
    print_error_and_exit
fi

BUILD="$1"
shift

# Capture any additional flags to pass through to rock
ROCK_FLAGS=("$@")

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

    echo
    success "Starting a HybridApp build!"
    export CUSTOM_APK_NAME="Expensify-debug.apk"
    export IS_HYBRID_APP="true"
else
    echo
    success "Starting a standalone NewDot build!"
    echo $ANDROID_MODE
    unset CUSTOM_APK_NAME
fi

# Check if the argument is one of the desired values
case "$BUILD" in
    --ios)
        npx rock run:ios --configuration $IOS_MODE --scheme "$SCHEME" --dev-server "${ROCK_FLAGS[@]}"
        ;;
    --ipad)
        npx rock run:ios --simulator "iPad Pro (12.9-inch) (6th generation)" --configuration $IOS_MODE --scheme "$SCHEME" --dev-server "${ROCK_FLAGS[@]}"
        ;;
    --ipad-sm)
        npx rock run:ios --simulator "iPad Pro (11-inch) (4th generation)" --configuration $IOS_MODE --scheme "$SCHEME" --dev-server "${ROCK_FLAGS[@]}"
        ;;
    --android)
        # Check if this is an Expensify developer with WARP (only they need cert import)
        if [[ "${IS_EXPENSIFY_EMPLOYEE:-false}" == "true" ]]; then
            if is_warp_active; then
                "${SCRIPT_DIR}/import-cloudflare-certs-into-jdk.sh"
            fi
        fi

        SENTRY_DISABLE_AUTO_UPLOAD=true npx rock run:android --variant $ANDROID_MODE --app-id $APP_ID --active-arch-only --verbose --dev-server "${ROCK_FLAGS[@]}"
        ;;
    *)
        print_error_and_exit
        ;;
esac
