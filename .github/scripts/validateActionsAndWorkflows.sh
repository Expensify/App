#!/bin/bash

echo 'Validates the Github Actions and workflows using the json schemas provided by (https://www.schemastore.org/json/)'

# Track exit codes separately so we can run a full validation, report errors, and exit with the correct code
declare EXIT_CODE=0

# Download the up-to-date json schemas for github actions and workflows
cd ./.github && mkdir ./tempSchemas || exit 1
curl https://json.schemastore.org/github-action.json --output ./tempSchemas/github-action.json --silent || exit 1
curl https://json.schemastore.org/github-workflow.json --output ./tempSchemas/github-workflow.json --silent || exit 1

# Validate the actions and workflows using the JSON schemas and ajv https://github.com/ajv-validator/ajv-cli
find ./actions/ -type f -name "*.yml" -print0 | xargs -0 -I file ajv -s ./tempSchemas/github-action.json -d file --strict=false || EXIT_CODE=1
find ./workflows/ -type f -name "*.yml" -print0 | xargs -0 -I file ajv -s ./tempSchemas/github-workflow.json -d file --strict=false || EXIT_CODE=1

if (( $EXIT_CODE == 1 )) then
  exit $EXIT_CODE
fi

# Cleanup after ourselves and delete the schemas
rm -rf ./tempSchemas

echo 'Lint Github Actions via actionlint (https://github.com/rhysd/actionlint)'

# If we are running this on a non-CI machine (e.g. locally), install shellcheck
if [[ -z "${CI}" ]]; then
  brew install shellcheck
fi

bash <(curl https://raw.githubusercontent.com/rhysd/actionlint/main/scripts/download-actionlint.bash)
./actionlint -color || EXIT_CODE=1

# Cleanup after ourselves and delete actionlint
rm -rf ./actionlint

exit $EXIT_CODE
