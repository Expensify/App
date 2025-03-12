#!/bin/bash

set -e

concurrently \
  --names 'CLI,SERVER' \
  --pad-prefix \
  --prefix '[{name}]' \
  --prefix-colors 'cyan,yellow' \
  'npm run build:cli' \
  'npm run build:server'
