#!/bin/bash

echo -e "This script helps you set up credentials needed to use Mapbox SDKs for iOS and Android\n\nWe need two kinds of tokens: one for downloading Mapbox's closed-sourced SDKs, and the other for accessing Mapbox's API from these SDKs"

echo -e "\nStep 1: Go to https://account.mapbox.com/access-tokens/. If you don't have a Mapbox account yet, crease one. Copy the token named \"Default public token.\" This token is used to call Mapbox API to display maps and get directions. Paste the copied token below and hit enter (the token won't be displayed)\n"

read -s -p "Default public token: " PUBLIC_TOKEN

echo -e "\n\nStep 2: Next, we will create a secret token needed to download Mapbox SDKs.\nIf you haven't already, create a secret token by clicking "Create a token" button on "https://account.mapbox.com/access-tokens/". Give the token a useful name (ex. Token for SDK downloads) and tick the checkbox next to "Downloads:Read" under the "Secret scopes".\nAll checkboxes under the "Public scopes" should be ticked by default, and you can leave them as is. Then, click the "Create token" button at the bottom of the page.\nCopy the value of the newly created token. You only have one chance to copy it. Paste the value below.\n"

read -s -p "Secret download token: " SECRET_TOKEN

echo -e "\n\nThank you for providing necessary credentials. Setting these credentials in relevant files...\n"

./scripts/configure-mapbox.sh $SECRET_TOKEN