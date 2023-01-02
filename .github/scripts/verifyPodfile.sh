#!/bin/bash

declare -r GREEN='\033[0;32m'
declare -r RED='\033[0;31m'
declare -r NC='\033[0m'

podfileSha=$(openssl sha1 ios/Podfile | awk '{print $2}')
podfileLockSha=$(awk '/PODFILE CHECKSUM: /{print $3}' ios/Podfile.lock)

echo "Podfile: $podfileSha"
echo "Podfile.lock: $podfileLockSha"

# Check Provisioning Style. If automatic signing is enabled, iOS builds will fail, so ensure we always have the proper profile specified
if grep -q 'PROVISIONING_PROFILE_SPECIFIER = chat_expensify_appstore' ios/NewExpensify.xcodeproj/project.pbxproj; then
    exit 0
else
    echo "Error: Automatic provisioning style is not allowed!"
    exit 1
fi

if [ "$podfileSha" == "$podfileLockSha" ]; then
    echo -e "${GREEN}Podfile verified!${NC}"
    exit 0
else
    echo -e "${RED}Error: Podfile.lock out of date with Podfile. Did you forget to run \`npx pod-install\`?${NC}"
    exit 1
fi
