#!/bin/bash

echo 'Validates the Github Actions and workflows using the json schemas provided by (https://www.schemastore.org/json/)'

# Download the up-to-date json schemas for github actions and workflows
cd ./.github && mkdir ./tempSchemas || exit 1
curl https://json.schemastore.org/github-action.json --output ./tempSchemas/github-action.json --silent || exit 1
curl https://json.schemastore.org/github-workflow.json --output ./tempSchemas/github-workflow.json --silent || exit 1

# Track exit codes separately so we can run a full validation, report errors, and exit with the correct code
declare EXIT_CODE=0

# This stores all the process IDs of the ajv commands so they can run in parallel
declare ASYNC_PROCESSES

# Arrays of actions and workflows
declare -r ACTIONS=(./actions/*/*/action.yml)
declare -r WORKFLOWS=(./workflows/*.yml)

# Validate the actions and workflows using the JSON schemas and ajv https://github.com/ajv-validator/ajv-cli
for ((i=0; i < ${#ACTIONS[@]}; i++)); do
  ACTION=${ACTIONS[$i]}
  ajv -s ./tempSchemas/github-action.json -d "$ACTION" --strict=false &
  ASYNC_PROCESSES[$i]=$!
done

for ((i=0; i < ${#WORKFLOWS[@]}; i++)); do
  WORKFLOW=${WORKFLOWS[$i]}
  ajv -s ./tempSchemas/github-workflow.json -d "$WORKFLOW" --strict=false &
  ASYNC_PROCESSES[${#ACTIONS[@]} + $i]=$!
done

# Wait for the background builds to finish
for PID in ${ASYNC_PROCESSES[*]}; do
  if ! wait $PID; then
    EXIT_CODE=$?
  fi
done

# Cleanup after ourselves and delete the schemas
rm -rf ./tempSchemas

if (( "$EXIT_CODE" != 0 )); then
  exit $EXIT_CODE
fi

echo
echo 'Lint Github Actions via actionlint (https://github.com/rhysd/actionlint)'

# If we are running this on a non-CI machine (e.g. locally), install shellcheck
if [[ -z "${CI}" && -z "$(command -v shellcheck)" ]]; then
  if [[ "$OSTYPE" != 'darwin'* || -z "$(command -v brew)" ]]; then
    echo 'This script requires shellcheck to be installed. Please install it and try again'
    exit 1
  fi

  brew install shellcheck
fi

curl -s curl https://raw.githubusercontent.com/rhysd/actionlint/main/scripts/download-actionlint.bash | bash -s -- 1.6.13
./actionlint -color || EXIT_CODE=1

# Cleanup after ourselves and delete actionlint
rm -rf ./actionlint

exit $EXIT_CODE
