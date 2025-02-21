#!/bin/bash

# Ensure the script exits on the first error
set -e

# Start WebSocket server, Webpack watch, and Express server concurrently with styled prefixes
concurrently -k \
  --names 'WEBPACK,HOT-REF,EXPRESS' \
  --pad-prefix \
  --prefix '[{name}]' \
  --prefix-colors 'cyan,magenta,green' \
  'npm run watch' \
  'npm run ws' \
  'npm run serve'
