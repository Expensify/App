---
name: agent-device-app-testing
description: Test the Expensify App on Android/iOS emulators using agent-device. Use only when user explicitly requests mobile device testing.
---

# Mobile App Testing with agent-device

Expensify App context for the base `agent-device` skill. The user directs what to test - this skill provides App-specific details so you don't have to look them up each time.

## App Details

| Key | Value |
|---|---|
| Android package | `com.expensify.chat.dev` |
| iOS bundle ID | `com.expensify.chat.dev` |
| Screenshot dir | `./agent-device-output/` |

## Startup Flow

Follow these steps after the base agent-device bootstrap (device selection and session). Each step gates the next.

### 1. Metro Dev Server

Check if Metro is already running:

```bash
lsof -i :8081
```

- **Running**: proceed.
- **Not running**: start it in a background terminal:
  ```bash
  npm run start   # runs Metro bundler on :8081
  ```
  Wait until Metro reports "Ready" before continuing.

### 2. Dev App

Check if the **dev** app (bundle ID ending in `.dev`) is installed on the device:

```bash
# iOS
xcrun simctl listapps booted | grep com.expensify.chat.dev
# Android
adb shell pm list packages | grep com.expensify.chat.dev
```

- **Installed**: open it via `agent-device open com.expensify.chat.dev`.
- **Not installed**: build and install with:
  ```bash
  npm run ios     # or: npm run android
  ```
  This handles everything (dependency download, compilation, installation, launch).

> **Never fall back to a different app.** Only `com.expensify.chat.dev` is valid for testing. If the build fails (expired tokens, missing deps, signing errors, etc.), stop and report the error to the user - do not attempt to use any other installed app.

## Dev Environment Sign-In

- **Email**: Any address works on dev (e.g. `testuser@expensify.com`)
- **Magic code**: `000000`
- **Onboarding**: Set `SKIP_ONBOARDING=true` in `.env` to bypass

## Notes

- **RN dev overlays**: Dismiss warning/error overlays if not blocking; report if recurring.
- **Keyboard**: Use `keyboard dismiss` if the on-screen keyboard blocks controls.
- **Navigation**: React Navigation transitions may cause brief accessibility tree lag. If `snapshot` is stale, take a `screenshot` for visual truth, then re-snapshot.
