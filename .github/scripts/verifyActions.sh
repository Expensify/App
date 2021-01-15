#!/bin/bash

declare -r GREEN='\033[0;32m'
declare -r RED='\033[0;31m'
declare -r NO_COLOR='\033[0m'

function report_success() {
  echo -e "${GREEN} Success! Files are identical!${NO_COLOR}"
}

function report_error() {
  echo -e "${RED} Error: Found difference between committed files and recompiled files.\n${NO_COLOR}Did you forget to run \`npm run gh-actions-build\`?"
}

mkdir tmp_actions
ncc build ../actions/bumpVersion/bumpVersion.js -o tmp_actions/bumpVersion/
cmp --silent file1 file2 && echo 'SUCCESS: Files Are Identical!' || echo 'ERROR: Files Are Different! Did you forget to run npm run gh-actions-build?'
