#!/bin/bash

# Mapbox SDK Credential Setup Script
# ==================================
#
# Purpose:
# --------
# This script assists users in setting up the necessary credentials to utilize
# Mapbox's closed-source SDKs for iOS and Android. It provides step-by-step
# guidance for obtaining a secret token from Mapbox and subsequently invokes
# the "setup-mapbox-sdk.sh" script to configure the development environment.
#
# Background:
# -----------
# To use the Mapbox SDKs for iOS and Android development, a secret token
# must be obtained from Mapbox's account page. This token is essential for
# authenticating downloads of the closed-source SDKs during the build process.
#
# Usage:
# ------
# To configure Mapbox, invoke this script by running the following command from the project's root directory:
# npm run configure-mapbox

# Use functions and varaibles from the utils script
source scripts/shellUtils.sh

# Intro message
title "This script helps you set up the credential needed to use Mapbox's closed-sourced SDKs for iOS and Android."
echo -e "\n"

echo -e "1. Visit: https://account.mapbox.com/access-tokens/\n"
echo -e "2. If you don't have a Mapbox account, create one.\n"
echo -e "3. Create a secret token needed to download Mapbox SDKs. If you haven't done this yet:"
echo -e "   - Click the \"Create a token\" button."
echo -e "   - Provide a descriptive name for the token (e.g., Token for SDK downloads)."
echo -e "   - Ensure the checkbox next to \"Downloads:Read\" under \"Secret scopes\" is ticked."
echo -e "   - All checkboxes under the \"Public scopes\" should be ticked by default. Leave them as they are."
echo -e "   - Click the \"Create token\" button at the bottom of the page."
echo -e "   - IMPORTANT: Copy the value of the newly created token. This is your only opportunity to do so."
echo -e "\nOnce you've done the above steps, please paste the token value below.\n"

# Reading the secret token
read -r -s -p "Secret download token: " SECRET_TOKEN
echo -e "\n"

if [[ -z "$SECRET_TOKEN" ]]; then
    error "Token is empty. Please run the script again and provide a valid token."
    exit 1
fi

success "Thank you for providing the token. Setting these credentials in relevant files..."
echo -e "\n"

# Execute the configuration script
./scripts/setup-mapbox-sdk.sh "$SECRET_TOKEN"
