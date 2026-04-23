---
name: agent-device
description: Drive iOS and Android devices for the Expensify App - testing, debugging, performance profiling, bug reproduction, and feature verification. Use when the developer needs to interact with the mobile app on a device.
allowed-tools: Bash(agent-device *) Bash(npm root *)
---

# agent-device

## Pre-flight

`agent-device` CLI version: !`agent-device --version 2>&1 || echo "NOT_INSTALLED"`

Canonical skill reference path (read these files directly for device automation guidance - bootstrap, exploration, verification, debugging): !`echo "$(npm root -g)/agent-device/skills/agent-device"`

> If the version line above shows `NOT_INSTALLED` or a command-not-found error, **STOP** and instruct the developer to install it: `npm install -g agent-device`. All device interaction depends on it.
