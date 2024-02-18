#!/bin/bash

# Script for starting android emulator correctly

# Use functions to select and open the emulator for iOS and Android
source scripts/select-device.sh

select_device_android
sleep 30
ensure_device_available
adb reverse tcp:8082 tcp:8082