#!/bin/bash

# Mapbox SDK Configuration Script for iOS and Android
# ===================================================
#
# Purpose:
# --------
# This script configures the development environment to download Mapbox SDKs
# for both iOS and Android builds. We use Mapbox to display maps in the App. As Mapbox SDKs
# are closed-sourced, we need to authenticate with Mapbox during the download.
#
# Background:
# -----------
# Engineers are required to obtain a secret token from Mapbox and store it on
# their development machine. This allows tools like CocoaPods for iOS or Gradle for Android
# to access the Mapbox SDK during the build process.
#
# The `.netrc` file for iOS Configuration:
# ----------------------------------------
# The token for iOS is stored in the `.netrc` file located in the user's home directory.
# This file is used in Unix-like systems to store credentials for remote machine access.
#
# The `gradle.properties` file for Android Configuration:
# -------------------------------------------------------
# The token for Android is stored in the `gradle.properties` file located in the .gradle directory
# in the user's home. This is accessed by the Android build system during the SDK download.
#
# How this script helps:
# ----------------------
# This script streamlines the process of adding the credential to both the `.netrc` and
# `gradle.properties` files. When executed, it prompts the user for the secret token and
# then saves it to the respective files along with other necessary information.\n
#
# Usage:
# ------
# To run this script, pass the secret Mapbox access token as a command-line argument:
# ./scriptname.sh YOUR_MAPBOX_ACCESS_TOKEN

# Use functions and varaibles from the utils script
source scripts/shellUtils.sh

NETRC_PATH="$HOME/.netrc"
GRADLE_PROPERTIES_PATH="$HOME/.gradle/gradle.properties"

# This function provides a user-friendly error message when the script encounters an error.
# It informs the user about probable permission issues and suggests commands to resolve them.
handleError() {
    echo -e "\n"
    
    error "The script failed."
    echo "The most probable reason is permissions."
    echo -e "Please ensure you have read/write permissions for the following:\n"
    
    echo -e "1. \033[1m$NETRC_PATH\033[0m"
    echo -e "2. \033[1m$GRADLE_PROPERTIES_PATH\033[0m"
    echo -e "\nYou can grant permissions using the commands:"
    echo -e "\033[1mchmod u+rw $NETRC_PATH\033[0m"
    echo -e "\033[1mchmod u+rw $GRADLE_PROPERTIES_PATH\033[0m"
    
    echo -e "\n"
    exit 1
}

# Set a trap to call the handleError function when any of the commands fail
trap handleError ERR

# Take the token as a command-line argument
TOKEN="$1"

# Check if the token was provided
if [ -z "$TOKEN" ]; then
    echo "Usage: $0 <YOUR_MAPBOX_ACCESS_TOKEN>"
    echo "No token provided. Exiting."
    exit 1
fi

# -----------------------------------------------
# iOS Configuration for .netrc
# -----------------------------------------------
info "Configuring $NETRC_PATH for Mapbox iOS SDK download"

# Check for existing Mapbox entries in .netrc
if grep -q "api.mapbox.com" "$NETRC_PATH"; then
    # Extract the current token from .netrc
    CURRENT_TOKEN=$(grep -A2 "api.mapbox.com" "$NETRC_PATH" | grep "password" | awk '{print $2}')
    
    # Compare the current token to the entered token
    if [ "$CURRENT_TOKEN" == "$TOKEN" ]; then
        echo -e "\nThe entered token matches the existing token in $NETRC_PATH. No changes made."
    else
        # Use sed to replace the old token with the new one
        sed -i.bak "/api.mapbox.com/,+2s/password $CURRENT_TOKEN/password $TOKEN/" "$NETRC_PATH"
        echo -e "\nToken updated in $NETRC_PATH"
    fi
else
    # If no existing entry, append the new credentials
    {
        echo "machine api.mapbox.com"
        echo "login mapbox"
        echo "password $TOKEN"
    } >> "$NETRC_PATH"
    
    # Set the permissions of the .netrc file to ensure it's kept private
    chmod 600 "$NETRC_PATH"
    
    echo -e "\n$NETRC_PATH has been updated with new credentials"
fi

# -----------------------------------------------
# Android Configuration for gradle.properties
# -----------------------------------------------
echo -e "\n"
info "Configuring $GRADLE_PROPERTIES_PATH for Mapbox Android SDK download"

# Ensure the .gradle directory exists
if [ ! -d "$HOME/.gradle" ]; then
    mkdir "$HOME/.gradle"
fi

# Check if gradle.properties exists. If not, create one.
if [ ! -f "$GRADLE_PROPERTIES_PATH" ]; then
    touch "$GRADLE_PROPERTIES_PATH"
fi

# Check if MAPBOX_DOWNLOADS_TOKEN already exists in the file
if grep -q "MAPBOX_DOWNLOADS_TOKEN" "$GRADLE_PROPERTIES_PATH"; then
    # Extract the current token from gradle.properties
    CURRENT_ANDROID_TOKEN=$(grep "MAPBOX_DOWNLOADS_TOKEN" "$GRADLE_PROPERTIES_PATH" | cut -d'=' -f2)
    
    # Compare the current token to the entered token
    if [ "$CURRENT_ANDROID_TOKEN" == "$TOKEN" ]; then
        echo -e "\nThe entered token matches the existing token in $GRADLE_PROPERTIES_PATH. No changes made."
    else
        sed -i.bak "s/MAPBOX_DOWNLOADS_TOKEN=$CURRENT_ANDROID_TOKEN/MAPBOX_DOWNLOADS_TOKEN=$TOKEN/" "$GRADLE_PROPERTIES_PATH"
        echo -e "\nToken updated in $GRADLE_PROPERTIES_PATH"
    fi
else
    echo "MAPBOX_DOWNLOADS_TOKEN=$TOKEN" >> "$GRADLE_PROPERTIES_PATH"
    echo -e "\n$GRADLE_PROPERTIES_PATH has been updated with new credentials"
fi
