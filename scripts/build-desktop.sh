#!/bin/bash
set -e

export ELECTRON_ENV=${1:-development}

if [[ "$ELECTRON_ENV" == "staging" ]]; then
  ENV_FILE=".env.staging"
elif [[ "$ELECTRON_ENV" == "production" ]]; then
  ENV_FILE=".env.production"
else
  ENV_FILE=".env"
fi

SCRIPTS_DIR=$(dirname "${BASH_SOURCE[0]}")
LOCAL_PACKAGES=$(npm bin)
source "$SCRIPTS_DIR/shellUtils.sh";

title "Bundling Desktop js Bundle Using Webpack"
info " • ELECTRON_ENV: $ELECTRON_ENV"
info " • ENV file: $ENV_FILE"
info ""
"$LOCAL_PACKAGES/webpack" --config config/webpack/webpack.desktop.js --env.envFile=$ENV_FILE

title "Building Desktop App Archive Using Electron"
info ""
shift 1
"$LOCAL_PACKAGES/electron-builder" --config config/electronBuilder.config.js "$@"
