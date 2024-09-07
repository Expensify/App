#!/bin/bash

SCRIPTS_DIR=$(dirname "${BASH_SOURCE[0]}")

source "$SCRIPTS_DIR/shellUtils.sh"

"$SCRIPTS_DIR"/set-pusher-suffix.sh

# Install ccache to perform cached build
if ! which ccache; then
  if ask_yes_no "ccache not found. Would you like to install it to speed up your local builds?"; then
    brew install ccache
  fi
fi

# Coming from https://reactnative.dev/docs/build-speed#local-caches, symlink ccache to C compilers used by React Native.
# Typically these packages exist in /usr/bin. Also typical is that `/usr/local/bin` appears before `/usr/bin` in your $PATH.
# So the way this works is to symlink ccache to the `/usr/local/bin` version of the package so it gets picked up by RN build commands.
packagesToSymlink=(
  gcc
  g++
  cc
  c++
  clang
  clang++
)

# Directory to store stashed original files in `/usr/local/bin` if they exist
tempDir=$(mktemp -d)

#if [[ ${#packagesToSymlinkToUsrLocal[@]} -ne 0 && ! -d /usr/local/bin ]]; then
#  mkdir -pv /usr/local/bin
#fi

# But before actually creating the symlinks, prepare a cleanup function to remove them
cleanup() {
  info "Cleaning up symlinks and restoring stashed packages"
  for pkg in "${packagesToSymlink[@]}"; do
    # remove symlinks
    if [[ -L "/usr/local/bin/$pkg" ]]; then
      sudo unlink -v "/usr/local/bin/$pkg"
    fi

    # restore stashed binaries
    if [[ -f "$tempDir/$pkg" ]]; then
      sudo mv -v "$tempDir/$pkg" "/usr/local/bin/$pkg"
    fi
  done

  # Remove the temporary directory
  rmdir "$tempDir"
}

# and remove the symlinks before exiting so we don't leave symlinks developers may not be aware of
trap cleanup EXIT

info "Stashing local C++ compilers and symlinking them with ccache"
for pkg in "${packagesToSymlink[@]}"; do
  # stash the existing binaries if present
  if [[ -f "/usr/local/bin/$pkg" ]]; then
    sudo mv -v "/usr/local/bin/$pkg" "$tempDir/$pkg"
  fi

  # create the symlinks
  sudo ln -sv "$(which ccache)" "/usr/local/bin/$pkg"
done

# Run the android build
trap 'warning "ccache was used for this failing build. Consider clearing the cache with `ccache --clear`"' ERR
npx react-native run-android --mode=developmentDebug --appId=com.expensify.chat.dev --active-arch-only
