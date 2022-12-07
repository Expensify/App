#!/bin/bash

source ./scripts/shellUtils.sh

title 'Validating the Github Actions and workflows using the json schemas provided by (https://www.schemastore.org/json/)'

function downloadSchema {
  [[ $1 = 'github-action.json' ]] && SCHEMA_NAME='GitHub Action' || SCHEMA_NAME='GitHub Workflow'
  info "Downloading $SCHEMA_NAME schema..."
  if curl "https://json.schemastore.org/$1" --output "./tempSchemas/$1" --silent; then
    success "Successfully downloaded $SCHEMA_NAME schema!"
  else
    error "Failed downloading $SCHEMA_NAME schema"
    exit 1
  fi
}

# Download the up-to-date json schemas for github actions and workflows
cd ./.github && mkdir ./tempSchemas || exit 1
downloadSchema 'github-action.json' || exit 1
downloadSchema 'github-workflow.json' || exit 1

# Track exit codes separately so we can run a full validation, report errors, and exit with the correct code
declare EXIT_CODE=0

# This stores all the process IDs of the ajv commands so they can run in parallel
declare ASYNC_PROCESSES

# Arrays of actions and workflows
declare -r ACTIONS=(./actions/*/*/action.yml)
declare -r WORKFLOWS=(./workflows/*.yml)

info 'Validating actions and workflows against their JSON schemas...'

# Validate the actions and workflows using the JSON schemas and ajv https://github.com/ajv-validator/ajv-cli
for ((i=0; i < ${#ACTIONS[@]}; i++)); do
  ACTION=${ACTIONS[$i]}
  ajv -s ./tempSchemas/github-action.json -d "$ACTION" --strict=false &
  ASYNC_PROCESSES[$i]=$!
done

for ((i=0; i < ${#WORKFLOWS[@]}; i++)); do
  WORKFLOW=${WORKFLOWS[$i]}

    # Skip linting e2e workflow due to bug here: https://github.com/SchemaStore/schemastore/issues/2579
    if [[ "$WORKFLOW" == './workflows/preDeploy.yml' ]]; then
      continue
    fi

  ajv -s ./tempSchemas/github-workflow.json -d "$WORKFLOW" --strict=false &
  ASYNC_PROCESSES[${#ACTIONS[@]} + $i]=$!
done

# Wait for the background builds to finish
for PID in ${ASYNC_PROCESSES[*]}; do
  wait $PID
  RESULT=$?
  if [[ $RESULT != 0 ]]; then
    EXIT_CODE=$RESULT
  fi
done

# Cleanup after ourselves and delete the schemas
rm -rf ./tempSchemas

title 'Lint Github Actions via actionlint (https://github.com/rhysd/actionlint)'

# If we are running this on a non-CI machine (e.g. locally), install shellcheck
if [[ -z "${CI}" && -z "$(command -v shellcheck)" ]]; then
  if [[ "$OSTYPE" != 'darwin'* || -z "$(command -v brew)" ]]; then
    echo 'This script requires shellcheck to be installed. Please install it and try again'
    exit 1
  fi

  brew install shellcheck
fi

info 'Downloading actionlint...'
if bash <(curl --silent https://raw.githubusercontent.com/rhysd/actionlint/main/scripts/download-actionlint.bash); then
  success 'Successfully downloaded actionlint!'
else
  error 'Error downloading actionlint'
  exit 1
fi

info 'Linting workflows...'
./actionlint -color || EXIT_CODE=1
if [[ "$EXIT_CODE" == 0 ]]; then
  success 'Workflows passed actionlint!'
fi

# Cleanup after ourselves and delete actionlint
rm -rf ./actionlint

exit $EXIT_CODE
