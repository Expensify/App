#!/bin/bash

# Utility script for iOS and Android Emulators
# ============================================
#
# Purpose:
# --------
# This script helps to start and kill iOS simulators and Android emulators instances.
#
# How this script helps:
# ----------------------
# This script streamlines the process of starting and killing on both android and ios
# platforms.

# Use functions and variables from the utils script
source scripts/shellUtils.sh

select_device_ios()
{
  # shellcheck disable=SC2124
  IFS="$@" arr=$(xcrun xctrace list devices | grep -E "iPhone|iPad")

  # Create arrays to store device names and identifiers
  device_names=()
  device_identifiers=()

  # Parse the device list and populate the arrays
  while IFS= read -r line; do
    if [[ $line =~ ^(.*)\ \((.*)\)\ \((.*)\)$ ]]; then
      device="${BASH_REMATCH[1]}"
      version="${BASH_REMATCH[2]}"
      identifier="${BASH_REMATCH[3]}"
      device_identifiers+=("$identifier")
      device_names+=("$device Version: $version")
    else
      info "Input does not match the expected pattern."
      echo "$line"
    fi
  done <<< "$arr"
  if [ ${#device_names[@]} -eq 0 ]; then
    error "No devices detected, please create one."
    exit 1
  fi
  if [ ${#device_names[@]} -eq 1 ]; then
    device_identifier="${device_identifiers[0]}"
    success "Single device detected, launching ${device_names[0]}"
    open -a Simulator --args -CurrentDeviceUDID "$device_identifier"
    return
  fi
  info "Multiple devices detected, please select one from the list."
  PS3='Please enter your choice: '
  select device_name in "${device_names[@]}"; do
    if [ -n "$device_name" ]; then
      selected_index=$((REPLY - 1))
      device_name_for_display="${device_names[$selected_index]}"
      device_identifier="${device_identifiers[$selected_index]}"
      break
    else
      echo "Invalid selection. Please choose a device."
  fi
  done
  success "Launching $device_name_for_display"
  open -a Simulator --args -CurrentDeviceUDID "$device_identifier"
}

kill_all_emulators_ios() {
  # kill all the emulators
  killall Simulator
}

restart_adb_server() {
  info "Restarting adb ..."
  adb kill-server
  sleep 2
  adb start-server
  sleep 2
  info "Restarting adb done"
}

ensure_device_available() {
  # Must turn off exit on error temporarily
  set +e
  if adb devices | grep -q offline; then
    restart_adb_server
    if adb devices | grep -q offline; then
      error "Device remains 'offline'.  Please investigate!"
      exit 1
    fi
  fi
  set -e
}

select_device_android()
{
  # shellcheck disable=SC2124
  IFS="$@" arr=$(emulator -list-avds)

  # Create arrays to store device names
  device_names=()

  # Parse the device list and populate the arrays
  while IFS= read -r line; do
    device_names+=("$line")
  done <<< "$arr"
  if [ ${#device_names[@]} -eq 0 ]; then
    error "No devices detected, please create one."
    exit 1
  fi
  if [ ${#device_names[@]} -eq 1 ]; then
    device_identifier="${device_names[0]}"
    success "Single device detected, launching $device_identifier"
    emulator -avd "$device_identifier" -writable-system > /dev/null 2>&1 &
    return
  fi
  info "Multiple devices detected, please select one from the list."
  PS3='Please enter your choice: '
  select device_name in "${device_names[@]}"; do
    if [ -n "$device_name" ]; then
      selected_index=$((REPLY - 1))
      device_identifier="${device_names[$selected_index]}"
      break
    else
      echo "Invalid selection. Please choose a device."
  fi
  done
  success "Launching $device_identifier"
  emulator -avd "$device_identifier" -writable-system > /dev/null 2>&1 &
}

kill_all_emulators_android() {
  # kill all the emulators
  adb devices | grep emulator | cut -f1 | while read -r line; do adb -s "$line" emu kill; done
}
