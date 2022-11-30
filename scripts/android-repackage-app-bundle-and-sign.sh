#!/bin/sh

###
# Takes an android app that has been built with the debug keystore,
# and re-packages it with an alternative JS bundle to run.
# It then signs the APK again, so you can simply install the app on a device.
# This is useful if you quickly want to test changes to the JS code with a
# release app, without having to rebuild the whole app.
#
# There are many outdated resources on how to re-sign an app. The main
# flow and commands have been taken from:
# - https://gist.github.com/floyd-fuh/7f7408b560672ece3ea78348559d47b6#file-repackage_apk_for_burp-py-L276-L319
#
# This script uses `apktool` instead of manually unzipping and zipping the app.
# Only with apktool it worked without any errors, so you need to install it.
###

BUILD_TOOLS=$ANDROID_SDK_ROOT/build-tools/31.0.0
APK=$1
NEW_BUNDLE_FILE=$2

### Helper function to use echo but print text in bold
function echo_bold() {
    echo "\033[1m$@\033[0m"
}

### Validating inputs

if [ -z "$APK" ]; then
    echo "Usage: $0 <apk> <new-bundle-file>"
    exit 1
fi
if [ -z "$NEW_BUNDLE_FILE" ]; then
    echo "Usage: $0 <apk> <new-bundle-file>"
    exit 1
fi
APK=$(realpath $APK)
if [ ! -f "$APK" ]; then
    echo "APK not found: $APK"
    exit 1
fi
NEW_BUNDLE_FILE=$(realpath $NEW_BUNDLE_FILE)
if [ ! -f "$NEW_BUNDLE_FILE" ]; then
    echo "Bundle file not found: $NEW_BUNDLE_FILE"
    exit 1
fi
# check if "apktool" command is available
if ! command -v apktool &> /dev/null
then
    echo "apktool could not be found. Please install it."
    exit 1
fi
# check if "jarsigner" command is available
if ! command -v jarsigner &> /dev/null
then
    echo "jarsigner could not be found. Please install it."
    exit 1
fi

KEYSTORE="$(realpath ./android/app/debug.keystore)"
ORIGINAL_WD=$(pwd)

### Copy apk to a temp dir

TMP_DIR=$(mktemp -d)
cp "$APK" "$TMP_DIR"
cd "$TMP_DIR"

### Dissemble app

echo_bold "Dissembling app..."
apktool d "$APK" -o app > /dev/null

### Copy new bundle into assets

echo_bold "Copying new bundle into assets..."
rm app/assets/index.android.bundle
cp "$NEW_BUNDLE_FILE" app/assets/index.android.bundle

### Reassemble app

echo_bold "Reassembling app..."
apktool b app -o app.apk > /dev/null

### Do jarsigner

echo_bold "Signing app..."
jarsigner -verbose -keystore $KEYSTORE -storepass android -keypass android app.apk androiddebugkey

### Do zipalign

echo_bold "Zipaligning app..."
$BUILD_TOOLS/zipalign -p -v 4 app.apk app-aligned.apk

### Do apksigner

echo_bold "Signing app with apksigner..."
$BUILD_TOOLS/apksigner sign  --v4-signing-enabled true --ks $KEYSTORE --ks-pass pass:android --ks-key-alias androiddebugkey --key-pass pass:android app-aligned.apk

### Copy back to original location

echo_bold "Copying back to original location..."
cp app-aligned.apk "$ORIGINAL_WD/app-repacked-signed.apk"
echo "Done. Repacked app is at $ORIGINAL_WD/app-repacked-signed.apk"

