---
name: agent-device
description: Drive iOS and Android devices for the Expensify App - testing, debugging, performance profiling, bug reproduction, and feature verification. Use when the developer needs to interact with the mobile app on a device.
allowed-tools: Bash(agent-device *) Bash(npm root *) Bash(scripts/is-hybrid-app.sh)
---

# agent-device

## Pre-flight (auto)

These checks evaluate at skill load. If any line shows `FAIL`, stop and surface the fix before running any device command.

`agent-device` version: !`R=0.18.0; V=$(agent-device --version 2>/dev/null); [ -n "$V" ] && [ "$(printf '%s\n%s\n' "$R" "$V" | sort -V | head -1)" = "$R" ] && echo "OK ($V)" || echo "FAIL (need v$R+, got: ${V:-not installed}). Fix: npm install -g agent-device@latest"`

Bundled CLI skills dir: !`D="$(npm root -g)/agent-device/skills/agent-device"; test -s "$D/SKILL.md" && echo "OK ($D)" || echo "FAIL (missing $D/SKILL.md). Fix: npm install -g agent-device@latest"`

HybridApp mode: !`M=$(scripts/is-hybrid-app.sh 2>/dev/null | tail -1); [ "$M" = "true" ] && echo "OK (HybridApp)" || echo "FAIL (got: ${M:-unknown}). This skill only supports the HybridApp build - ensure the Mobile-Expensify submodule is present."`

## Bring-up

Run this sequence the first time the user asks for device interaction in a session, before any `open` / `snapshot` / `replay`.

### 1. Platform

If the user prompt names `ios` or `android` explicitly, use it. Otherwise ask. Only iOS and Android are supported; reject other platforms.

### 2. Bundle ID

HybridApp dev builds only (the pre-flight gate enforces this).

| Platform  | Bundle ID                       | Build command from App root |
| --------- | ------------------------------- | --------------------------- |
| `ios`     | `com.expensify.expensifylite`   | `npm run ios`               |
| `android` | `org.me.mobiexpensifyg.dev`     | `npm run android`           |

### 3. Confirm dev build is installed

```bash
agent-device apps --platform <p> --json
```

If the resolved bundle ID is missing from the list, **STOP** and instruct the developer to run the matching build command from the App repository root. The build script detects HybridApp mode and builds the native app from `Mobile-Expensify/`.

### 4. Metro

```bash
agent-device metro prepare --public-base-url http://localhost:8081 --port 8081 --kind react-native
```

If `metro prepare` fails, **STOP** and surface the error verbatim.

### 5. Pick a target device

```bash
agent-device devices --platform <p> --json
```

- Prefer the first device with `booted=true`.
- If none are booted, choose the default target device (usually the first listed), then continue to step 6 to detect and clear any stale session bound to that device before opening.
- If multiple are booted, ask the user which.

Capture the device name and (for iOS) the simulator UDID, or (for Android) the serial.

### 6. Session reuse vs reset

```bash
agent-device session list --json
```

For each entry whose `device_udid` (iOS) or `serial` (Android) matches the chosen device:

- If the session was created earlier in the **current** Claude invocation, reuse it silently.
- Otherwise prompt: `reuse` (continue with the existing session) or `reset` (force-close it).
  - To reset: `agent-device close --shutdown --session <name>`. `--shutdown` also frees the simulator.

### 7. Open

```bash
agent-device open <bundle-id> --platform <p> --device "<name>"
```

If `open` errors with "app not installed", revisit step 3.

### 8. Sanity

```bash
agent-device snapshot -i
```

Confirm the app rendered. From here, follow the [Agent decision loop](flows/README.md) for repeatable flows or drive interactively.

### 9. Interaction safety

After opening or relaunching the App, inspect `agent-device snapshot -i` for React Native development overlays before interacting.

If the snapshot reports a LogBox warning, run:

```bash
agent-device react-native dismiss-overlay
agent-device snapshot -i
```

Continue only when the fresh snapshot no longer reports the overlay. Multiple LogBox banners can require repeated `dismiss-overlay` and fresh `snapshot -i` calls. If the snapshot reports a RedBox fatal error, stop and surface the error instead of dismissing it.

Before pressing an action that may be covered by an overlay or system UI:

```bash
agent-device snapshot -i
agent-device screenshot --overlay-refs
```

Use a stable selector or a fresh `@eN` reference. Confirm the target is reported as hittable. Never use coordinates to bypass `interactionBlocked: "covered"`, `reason: "offscreen_ref"`, or `targetHittable: false`.

When a target is rejected, capture `agent-device screenshot --overlay-refs`. Dismiss a recoverable LogBox overlay when present, capture a fresh `snapshot -i`, and retry only through a selector or fresh reference. Otherwise stop and report the blocker.

After pressing the action, verify the expected destination or control state with `wait`, `is`, `find`, or a fresh snapshot.

### Canonical skill references

Read these files directly for device automation guidance (bootstrap, exploration, verification, debugging): !`echo "$(npm root -g)/agent-device/skills/agent-device"`

## Flows

Repeatable steps (sign-in, onboarding, etc.) are captured as composable `.ad` snippets under [`flows/`](flows/README.md). For interactive usage, propose and run only `flows/macros/` helpers. `flows/tests/` belongs to a separate QA workflow and must not be proposed by this skill; QA/perf runs execute them via `agent-device test <path>`.
