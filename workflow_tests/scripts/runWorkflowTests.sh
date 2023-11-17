#!/bin/bash

source ./scripts/shellUtils.sh

title 'GitHub Actions workflow tests'
printf '\n'

# Check setup
info 'Checking environment setup'

# Check if docker is installed
if ! docker --version > /dev/null 2>&1; then
  error 'Docker is not installed'
  info 'Act requires docker to be installed. Please install docker and try again'
  exit 1
fi
info 'Docker installed'

# Check if docker is running
if ! docker info > /dev/null 2>&1; then
  error 'Docker is not running'
  info 'Act requires docker engine to be running. Enable docker engine and try again'
  exit 1
fi
info 'Docker engine running'

# Check if act is installed
if ! act --version > /dev/null 2>&1; then
  error 'Act not installed'
  info 'Install Act with brew install act and follow the documentation on first Act run (https://github.com/nektos/act#first-act-run)'
  exit 1
fi
info 'Act installed'

# Check if ACT_BINARY is set
if [[ -z ${ACT_BINARY} ]]; then
  info 'ACT_BINARY not set, checking .env file'
  if [ -f .env ]; then
    set -a
    source .env
    set +a
  else
    info '.env file does not exist'
  fi
  if [[ -z ${ACT_BINARY} ]]; then
    error 'ACT_BINARY variable not set'
    info 'To make sure Act behaves in a predictable manner please set the ACT_BINARY environment variable to the path to your Act binary'
    exit 1
  fi
fi
info 'ACT_BINARY environment variable set'

if ! eval '${ACT_BINARY} --version' > /dev/null 2>&1; then
  error 'ACT_BINARY variable not set properly'
  info 'ACT_BINARY environment variable should be set to the path to your Act executable. Please set the variable correctly (try running "which act" to check the path)'
  exit 1
fi
info 'ACT_BINARY environment variable set to an Act executable'

success 'Environment setup properly - running tests'

# Run tests
npm test -- --config=workflow_tests/jest.config.js --runInBand "$@"
