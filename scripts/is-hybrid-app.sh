#!/bin/bash
set -e

cd Mobile-Expensify || echo false

# Check if 'package.json' exists
if [[ -f package.json ]]; then
    # Read the 'name' field from 'package.json'

    package_name=$(jq -r '.name' package.json 2>/dev/null)
    # Check if the 'name' field is 'mobile-expensify'
    if [[ "$package_name" == "mobile-expensify" ]]; then
        echo true
        exit 0
    else
        echo "Wrong package name in Mobile-Expensify"
        exit 1
    fi
else
    echo "package.json not found in Mobile-Expensify"
    echo false
fi