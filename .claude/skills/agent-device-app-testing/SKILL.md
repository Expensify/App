---
name: agent-device-app-testing
description: Test the Expensify App on Android/iOS emulators using agent-device. Use after mobile/React Native code changes, for debugging mobile UI issues, or when user requests mobile testing.
alwaysApply: false
---

# Mobile App Testing with agent-device

## When to Use This Skill

Use mobile device testing when:
- User requests testing the App on Android or iOS emulator/simulator
- Verifying fixes or improvements to mobile/React Native UI code
- Debugging mobile-specific issues (navigation, gestures, keyboard, native modules)
- Reproducing bugs that only appear on mobile

**Proactively use after making mobile or React Native code changes** to verify your work functions correctly on device.

## When NOT to Use This Skill

Skip mobile device testing for:
- Web-only changes (use playwright-app-testing instead)
- Unit tests (use `npm run test`)
- Type checking (use `npm run typecheck`)
- Backend/API-only changes

## App Details

- **Package name**: `com.expensify.chat`
- **Screenshot directory**: `./agent-device-output/`

## Dev Environment Sign-In

When signing in on the emulator/simulator:
- **Email**: Generate a random Gmail address (e.g., `testuser+<random_digits>@gmail.com`)
- **Magic code**: Always `000000`
- **Onboarding**: Check `SKIP_ONBOARDING` in `.env` - set to `true` unless specifically testing onboarding flows

## Workflow

The base `agent-device` skill handles all device interaction commands. This skill provides App-specific context only.

### 1. Boot and install

```bash
# Android
agent-device boot --platform android
APK_PATH=$(find .rock/cache/android -name "*.apk" -print -quit)
agent-device reinstall com.expensify.chat "$APK_PATH" --platform android

# iOS
agent-device boot --platform ios
IPA_PATH=$(find .rock/cache/ios -name "*.app" -print -quit)
agent-device reinstall com.expensify.chat "$IPA_PATH" --platform ios
```

### 2. Open app and start session

```bash
agent-device open com.expensify.chat --platform android --session test
```

### 3. Sign in

```bash
# Snapshot to see login screen
agent-device snapshot -i --session test

# Fill email and continue
agent-device fill @<email_ref> "testuser+<random>@gmail.com" --session test
agent-device press @<continue_ref> --session test

# Enter magic code
agent-device snapshot -i --session test
agent-device fill @<code_ref> "000000" --session test
```

### 4. Navigate, interact, verify

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

- **React Native dev overlays**: After opening, check for warning/error overlays. Dismiss if not blocking; report if recurring.
- **Keyboard**: Use `keyboard dismiss` if the on-screen keyboard blocks controls you need to interact with.
- **Navigation**: The app uses React Navigation - screen transitions may cause brief accessibility tree lag. If `snapshot` doesn't match expectations, take a `screenshot` for visual truth, then re-snapshot.

## Example Usage

```
Scenario 1: User requests mobile testing
User: "Test the expense creation flow on Android"
-> Boot emulator, install app, sign in, test the flow

Scenario 2: After making RN changes
You: "I've updated the expense input component"
-> Proactively test the change on emulator to verify

Scenario 3: Mobile-specific bug
User: "The keyboard covers the submit button on iOS"
-> Boot iOS simulator, reproduce and verify the issue
```
