#!/bin/bash

for env in production staging dev adhoc
do
    if [ "$env" = "staging" ]; then
        suffix="Staging"
    elif [ "$env" = "dev" ]; then
        suffix="Dev"
    elif [ "$env" = "adhoc" ]; then
        suffix="Adhoc"
    fi

    SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

    mkdir -p "$SCRIPT_DIR/../Mobile-Expensify/iOS/icons"
    
    /Applications/Xcode.app/Contents/Developer/usr/bin/actool \
        "$SCRIPT_DIR/../Mobile-Expensify/iOS/AppIcon${suffix}.icon" \
        --compile "$SCRIPT_DIR/../Mobile-Expensify/iOS/icons" \
        --output-format human-readable-text --notices --warnings --errors \
        --output-partial-info-plist "$SCRIPT_DIR/../Mobile-Expensify/iOS/Info.plist" \
        --app-icon "AppIcon${suffix}" \
        --include-all-app-icons \
        --minimum-deployment-target 26.0 \
        --enable-on-demand-resources NO \
        --development-region en \
        --target-device mac \
        --platform macosx
        
    cp "$SCRIPT_DIR/../Mobile-Expensify/iOS/icons/Assets.car" "$SCRIPT_DIR/../desktop/Assets${suffix}.car"
    rm -rf "$SCRIPT_DIR/../Mobile-Expensify/iOS/icons"
done


