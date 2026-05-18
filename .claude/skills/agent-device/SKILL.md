---
name: agent-device
description: Drive iOS and Android devices for the Expensify App - testing, debugging, performance profiling, bug reproduction, and feature verification. Use when the developer needs to interact with the mobile app on a device.
allowed-tools: Bash(agent-device *) Bash(npm root *) Bash(scripts/is-hybrid-app.sh)
---

# agent-device

## Pre-flight (auto)

These checks evaluate at skill load. If any line shows `FAIL`, stop and surface the fix before running any device command.

`agent-device` version: !`R=0.13.0; V=$(agent-device --version 2>/dev/null); [ -n "$V" ] && [ "$(printf '%s\n%s\n' "$R" "$V" | sort -V | head -1)" = "$R" ] && echo "OK ($V)" || echo "FAIL (need v$R+, got: ${V:-not installed}). Fix: npm install -g agent-device@latest"`

Bundled CLI skills dir: !`D="$(npm root -g)/agent-device/skills/agent-device"; test -s "$D/SKILL.md" && echo "OK ($D)" || echo "FAIL (missing $D/SKILL.md). Fix: npm install -g agent-device@latest"`

HybridApp mode: !`M=$(scripts/is-hybrid-app.sh 2>/dev/null | tail -1); [ "$M" = "true" ] && echo "OK (HybridApp)" || echo "FAIL (got: ${M:-unknown}). This skill only supports the HybridApp build - ensure the Mobile-Expensify submodule is present."`

## Bring-up

Run this sequence the first time the user asks for device interaction in a session, before any `open` / `snapshot` / `replay`.

### 1. Platform

If the user prompt names `ios` or `android` explicitly, use it. Otherwise ask. Only iOS and Android are supported; reject other platforms.

### 2. Bundle ID

HybridApp dev builds only (the pre-flight gate enforces this).

| Platform  | Bundle ID                       | Build script      |
| --------- | ------------------------------- | ----------------- |
| `ios`     | `com.expensify.expensifylite`   | `npm run ios`     |
| `android` | `org.me.mobiexpensifyg.dev`     | `npm run android` |

### 3. Confirm dev build is installed

```bash
agent-device apps --user-installed --platform <p> --json
```

If the resolved bundle ID is missing from the list, **STOP** and instruct the developer to run the matching build script from the table. HybridApp mobile builds **must** be initiated from `Mobile-Expensify/` (per project CLAUDE.md).

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

### Canonical skill references

Read these files directly for device automation guidance (bootstrap, exploration, verification, debugging): !`echo "$(npm root -g)/agent-device/skills/agent-device"`

## Flows

Repeatable steps (sign-in, onboarding, etc.) are captured as composable `.ad` snippets under [`flows/`](flows/README.md). For interactive usage, propose and run only `flows/macros/` helpers. `flows/tests/` belongs to a separate QA workflow and must not be proposed by this skill; QA/perf runs execute them via `agent-device test <path>`.
