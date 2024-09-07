#!/bin/bash

SCRIPTS_DIR=$(dirname "${BASH_SOURCE[0]}")

source "$SCRIPTS_DIR/ccache-utils.sh"
source "$SCRIPTS_DIR/shellUtils.sh"

"$SCRIPTS_DIR"/set-pusher-suffix.sh

# Install ccache to perform cached build
install_ccache

if which ccache; then
  # remove the symlinks before exiting so we don't leave symlinks developers may not be aware of
  trap cleanup_ccache_symlinks EXIT

  create_ccache_symlinks

  # warn developers to clear cache if build fails
  trap 'warning "ccache was used for this failing build. Consider clearing the cache with `ccache --clear`"' ERR
fi

# Run the android build
npx react-native run-android --mode=developmentDebug --appId=com.expensify.chat.dev --active-arch-only
