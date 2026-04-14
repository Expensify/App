---
name: agent-device-app-testing
description: Test the Expensify App on Android/iOS emulators using agent-device. Use only when user explicitly requests mobile device testing.
---

# Mobile App Testing with agent-device

Expensify App context for the base `agent-device` skill. The user directs what to test - this skill provides App-specific details so you don't have to look them up each time.

## Prerequisites

The `agent-device` CLI must be installed on the host machine. It is **not** bundled with this repo.

```bash
npm install -g agent-device
agent-device --version
```

Android testing requires the Android SDK + an AVD. iOS requires Xcode + a simulator runtime.

## App Details

| Key | Value |
|---|---|
| Android package | `com.expensify.chat.dev` (dev) / `com.expensify.chat` (release) |
| iOS bundle ID | `com.expensify.chat.dev` (dev) / `com.expensify.chat` (release) |
| Screenshot dir | `./agent-device-output/` |

## Building and Installing

The project uses [Rock](https://rockjs.dev/) which downloads pre-built artifacts from S3 first, falling back to local compilation if no match. Metro must be running in a separate terminal.

```bash
npm install
npm run start          # metro - separate terminal
npm run android        # or: npm run ios
```

Full setup details: [SETUP_ANDROID.md](contributingGuides/SETUP_ANDROID.md) | [SETUP_IOS.md](contributingGuides/SETUP_IOS.md)

## Dev Environment Sign-In

- **Email**: Any address works on dev (e.g. `testuser@expensify.com`)
- **Magic code**: `000000`
- **Onboarding**: Set `SKIP_ONBOARDING=true` in `.env` to bypass

## Notes

- **RN dev overlays**: Dismiss warning/error overlays if not blocking; report if recurring.
- **Keyboard**: Use `keyboard dismiss` if the on-screen keyboard blocks controls.
- **Navigation**: React Navigation transitions may cause brief accessibility tree lag. If `snapshot` is stale, take a `screenshot` for visual truth, then re-snapshot.
