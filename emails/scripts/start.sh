#!/bin/bash

set -e

# Concurrently run:
# 1. Watched webpack build (creating dist/server.bundle.js)
# 2. LiveReloadServer websocket server for opening and hot-reloading browser tabs.
#     - Note: this is intentionally a separate process from the express server,
#       because that server reboots with each updated webpack build,
#       so keeping track of connected browser tabs would be impossible
# 3. Express server, running the code in dist/server.bundle.js. This uses nodemon to reboot when the source code changes.
concurrently -k \
  --names 'WEBPACK,EXPRESS,HOT-REF' \
  --pad-prefix \
  --prefix '[{name}]' \
  --prefix-colors 'magenta,green,cyan' \
  'npm run watch' \
  'npm run serve' \
  'npm run ws'
