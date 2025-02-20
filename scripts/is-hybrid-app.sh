#!/bin/bash
set -e

if [[ ! -d Mobile-Expensify ]]; then
    echo false
    exit 0
else
    cd Mobile-Expensify
fi

# Check if 'package.json' exists
if [[ -f package.json ]]; then
    # Read the 'name' field from 'package.json'
    package_name=$(jq -r '.name' package.json 2>/dev/null)

    # Check if the 'name' field is 'mobile-expensify'
    if [[ "$package_name" == "mobile-expensify" ]]; then
        echo true
        exit 0
    fi
else
    echo "package.json not found in Mobile-Expensify"
    echo false
fi
