#!/bin/bash

# Mapbox SDK Configuration Script
# ================================
#
# Purpose:
# --------
# This script configures the development environment to download Mapbox SDKs 
# for iOS and Android builds. We use Mapbox to display maps in the App. As Mapbox SDKs 
# are closed-sourced, we need to authenticate with Mapbox during the download.
#
# Background:
# -----------
# Engineers are required to obtain a secret token from Mapbox and store it on 
# their development machine. This allows tools like CocoaPods or Gradle to access 
# the Mapbox SDK during the build process.
#
# The `.netrc` file:
# ------------------
# The token is stored in the `.netrc` file located in the user's home directory.
# This file is used in Unix-like systems to store credentials for remote machine access.
#
# How this script helps:
# ----------------------
# This script streamlines the process of adding the credential to the `.netrc` file.
# When executed, it prompts the user for the secret token and then saves it 
# to the `.netrc` file along with other necessary information.

# Prompt the user for the token
read -p "Enter your secret Mapbox access token: " TOKEN

# If the user didn't provide the token, exit
if [ -z "$TOKEN" ]; then
    echo "No token provided. Exiting."
    exit 1
fi

# Check for existing Mapbox entries in .netrc
if grep -q "api.mapbox.com" ~/.netrc; then
    # Extract the current token from .netrc
    CURRENT_TOKEN=$(grep -A2 "api.mapbox.com" ~/.netrc | grep "password" | awk '{print $2}')
    
    # Compare the current token to the entered token
    if [ "$CURRENT_TOKEN" == "$TOKEN" ]; then
        echo "The entered token matches the existing token in .netrc. No changes made."
    else
        # Use sed to replace the old token with the new one
        sed -i.bak "/api.mapbox.com/,+2s/password $CURRENT_TOKEN/password $TOKEN/" ~/.netrc
        echo "Token updated in .netrc!"
    fi
else
    # If no existing entry, append the new credentials
    echo "machine api.mapbox.com" >> ~/.netrc
    echo "login mapbox" >> ~/.netrc
    echo "password $TOKEN" >> ~/.netrc

    # Set the permissions of the .netrc file to ensure it's kept private
    chmod 600 ~/.netrc

    echo ".netrc has been updated with new credentials!"
fi