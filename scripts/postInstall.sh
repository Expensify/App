#!/bin/bash

# Go to project root
ROOT_DIR=$(dirname "$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &> /dev/null && pwd)")
cd "$ROOT_DIR" || exit 1

# Run patch-package
npx patch-package

# Install node_modules in subpackages, unless we're in a CI/CD environment.
# See `.github/actions/composite/setupNode/action.yml` for more context
if [[ -n ${CI+x} ]]; then
  echo 'Installing desktop/node_modules'
  cd desktop || exit 1
  npm install
fi
