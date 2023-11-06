#!/bin/bash

# NewDot Web Configuration Script for iOS and Android Emulators
# =============================================================
#
# Purpose:
# --------
# This script configures Configure iOS simulators and Android emulators to connect to
# new.expensify.com.dev over https for local development.
#
# Background:
# -----------
# We plan to change the URL to serve the App on the development environment from
# localhost:8082 to new.expensify.com.dev. This can be accomplished by adding a new entry
# to the laptop's hosts file along with changes made in the PR.
# However, we're not sure how we can access the App on Safari or Chrome on iOS or Android
# simulators.
#
# How this script helps:
# ----------------------
# This script streamlines the process of adding the certificates to both android and
# ios platforms.
#
# Usage:
# ------
# To run this script, pass the platform on which you want to run as a command-line
# argument which can be the following:
# 1. ios
# 2. android
# 3. all (default)
# ./setup-newdot-web-emulators.sh platform

# Use functions and variables from the utils script
source scripts/shellUtils.sh

# Use functions to select and open the emulator for iOS and Android
source scripts/select-device.sh

if [ $# -eq 0 ]; then
  platform="all"
else
  platform=$1
fi

setup_ios()
{
  select_device_ios
  sleep 30
  info "Installing certificates on iOS simulator"
  xcrun simctl keychain booted add-root-cert "$(mkcert -CAROOT)/rootCA.pem"
  kill_all_emulators_ios
}

setup_android_path_1()
{
  adb root || {
    error "Failed to restart adb as root"
    info "You may want to check https://stackoverflow.com/a/45668555"
    exit 1
  }
  sleep 2
  adb remount
  adb push /etc/hosts /system/etc/hosts
  kill_all_emulators_android
}

setup_android_path_2()
{
  adb root || {
    error "Failed to restart adb as root"
    info "You may want to check https://stackoverflow.com/a/45668555"
    exit 1
  }
  sleep 2
  adb disable-verity
  adb reboot
  sleep 30
  ensure_device_available
  adb root
  sleep 2
  adb remount
  adb push /etc/hosts /system/etc/hosts
  kill_all_emulators_android
}

setup_android()
{
  select_device_android
  sleep 30
  ensure_device_available
  info "Installing certificates on Android emulator"
  setup_android_path_1 || {
    info "Looks like the system partition is read-only"
    info "Trying another method to install the certificates"
    setup_android_path_2
  }
}

if [ "$platform" = "ios" ] || [ "$platform" = "all" ]; then
  setup_ios || { 
    error "Failed to setup iOS simulator"
    exit 1 
  }
fi

if [ "$platform" = "android" ] || [ "$platform" = "all" ]; then
  setup_android || { 
    error "Failed to setup Android emulator"
    exit 1 
  }
fi

success "Done!"
