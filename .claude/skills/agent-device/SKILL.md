---
name: agent-device
description: Drive iOS and Android devices for the Expensify App - testing, debugging, performance profiling, bug reproduction, and feature verification. Use when the developer needs to interact with the mobile app on a device.
allowed-tools: Bash(agent-device *) Bash(npm root *)
---

# agent-device

## Pre-flight

<!-- The line below compares the installed `agent-device --version` to the required minimum 0.13.0 -->

`agent-device` version check: !`R=0.13.0; V=$(agent-device --version 2>/dev/null); [ -n "$V" ] && [ "$(printf '%s\n%s\n' "$R" "$V" | sort -V | head -1)" = "$R" ] && echo "OK ($V)" || echo "FAIL (need v$R+, got: ${V:-not installed})"`

> If the version check above shows `FAIL`, **STOP** and instruct the developer: `npm install -g agent-device@latest`.

Canonical skill reference path (read these files directly for device automation guidance - bootstrap, exploration, verification, debugging): !`echo "$(npm root -g)/agent-device/skills/agent-device"`

## Dev prerequisites

Default assumption: dev build from this repo. Before `open <app>`, both must be true:

1. **Metro dev server** running: `npm run start` (background).
2. **Dev build installed** on target: `npm run ios` or `npm run android` from the repo root.

Skip these only when the developer explicitly targets a non-dev build (e.g., standalone/prod artifact, or a pre-installed release build).

## Flows

Repeatable steps (sign-in, onboarding, etc.) are captured as composable `.ad` snippets under [`flows/`](flows/README.md). Before manually tapping through a screen, follow the **Agent decision loop** in [`flows/README.md`](flows/README.md) - it covers discovery, `@pre` filtering, replay, and `@post` verification.
