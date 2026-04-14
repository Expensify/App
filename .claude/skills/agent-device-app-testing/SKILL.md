---
name: agent-device-app-testing
description: Test the Expensify App on Android/iOS emulators using agent-device. Use when user explicitly requests mobile device testing, or when debugging a mobile-only issue that cannot be verified any other way.
alwaysApply: false
---

# Mobile App Testing with agent-device

## Prerequisites

The `agent-device` CLI must be installed on the host machine. It is **not** bundled with this repo.

```bash
# Install (requires Node 20+)
npm install -g agent-device

# Verify
agent-device --version
```

For Android testing, the Android SDK and an AVD (emulator image) must be available. For iOS, Xcode and a simulator runtime are required.

## When to Use

- User explicitly requests testing the App on an Android emulator or iOS simulator
- Debugging a mobile-only issue (gestures, keyboard, native modules, navigation)
- Reproducing a bug that only appears on device

Do **not** use for web-only changes (use `playwright-app-testing`), unit tests (`npm run test`), or type checking (`npm run typecheck`).

## App Details

| Key | Value |
|---|---|
| Android package | `com.expensify.chat.dev` (dev) / `com.expensify.chat` (release) |
| iOS bundle ID | `com.expensify.chat.dev` (dev) / `com.expensify.chat` (release) |
| Screenshot dir | `./agent-device-output/` |

## Dev Environment Sign-In

- **Email**: Use `<anything>@expensify.com` or any address you control on the dev server
- **Magic code**: `000000` (always works on dev)
- **Onboarding**: Set `SKIP_ONBOARDING=true` in `.env` unless specifically testing onboarding

## Workflow

The base `agent-device` skill handles all device interaction commands. This skill adds Expensify App context only.

### 1. Boot emulator and build/install

**Local build (primary)** - builds and installs in one step:

```bash
# Android
agent-device boot --platform android
npx react-native run-android --mode developmentDebug

# iOS
agent-device boot --platform ios
npx react-native run-ios --mode Development-Debug --simulator "iPhone 16 Pro"
```

**Pre-built artifact (optional)** - if you have an APK/IPA from CI or Rock cache:

```bash
# Android
agent-device boot --platform android
agent-device reinstall com.expensify.chat.dev ./path/to/app.apk --platform android

# iOS
agent-device boot --platform ios
agent-device reinstall com.expensify.chat.dev ./path/to/App.app --platform ios
```

### 2. Open app and start session

```bash
agent-device open com.expensify.chat.dev --platform android --session test
```

### 3. Sign in

```bash
# Read login screen
agent-device snapshot -i --session test

# Fill email and continue
agent-device fill @<email_ref> "testuser@expensify.com" --session test
agent-device press @<continue_ref> --session test

# Enter magic code
agent-device snapshot -i --session test
agent-device fill @<code_ref> "000000" --session test
```

### 4. Navigate and interact

Use the standard agent-device snapshot/interact loop:
- `snapshot` to read the screen
- `snapshot -i` when you need interactive refs
- `press`, `fill`, `type`, `scroll` to interact
- Re-snapshot after every meaningful UI change

### 5. Capture evidence and shutdown

```bash
mkdir -p ./agent-device-output
agent-device screenshot ./agent-device-output/<step>-<description>.png --session test
agent-device close --shutdown --session test
```

## App-Specific Notes

- **RN dev overlays**: Dismiss warning/error overlays if not blocking; report if recurring.
- **Keyboard**: Use `keyboard dismiss` if the on-screen keyboard blocks controls.
- **Navigation**: React Navigation transitions may cause brief accessibility tree lag. If `snapshot` doesn't match, take a `screenshot` for visual truth, then re-snapshot.
