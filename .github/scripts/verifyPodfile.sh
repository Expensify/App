#!/bin/bash

declare -r GREEN='\033[0;32m'
declare -r RED='\033[0;31m'
declare -r NC='\033[0m'

podfileSha=$(openssl sha1 ios/Podfile | awk '{print $2}')
podfileLockSha=$(awk '/PODFILE CHECKSUM: /{print $3}' ios/Podfile.lock)

echo "Podfile: $podfileSha"
echo "Podfile.lock: $podfileLockSha"

if [ $podfileSha == $podfileLockSha ]; then
    echo -e "${GREEN}Podfile verified!${NC}"
else
    echo -e "${RED}Error: Podfile.lock out of date with Podfile. Did you forget to run \`npx pod-install\`?${NC}"
    exit 1
fi

pod install

DIFF_OUTPUT=$(git diff --exit-code)
EXIT_CODE=$?

if [[ EXIT_CODE -eq 0 ]]; then
    echo -e "${GREEN}Podfile is up to date!${NC}"
    exit 0
else
    echo -e "${RED}Error: Diff found when pods were rebuilt. Did you forget to run \`pod install\`? Do you need to merge main?${NC}"
    echo "$DIFF_OUTPUT" | $LIB_PATH/diff-so-fancy | less --tabs=4 -RFX
    exit 1
fi
