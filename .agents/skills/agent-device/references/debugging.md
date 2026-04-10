# Debugging

## When to open this file

Open this file when the task turns into failure triage, logs, network inspection, permission prompts, setup trouble, or unstable session behavior.

## Main commands to reach for first

- `logs clear --restart`
- `network dump`
- `logs path`
- `logs doctor`
- `alert wait`
- `alert accept` or `alert dismiss`

## Most common mistake to avoid

Do not leave logging on for normal flows or dump full log files into context. Keep debug windows short and inspect logs with `grep` or `tail`.

In React Native dev or debug builds, do not dismiss visible warning or error overlays without remembering to report them later. If you close one to keep the flow moving, keep at least a screenshot or a short marked log window so the summary can name it.

## Canonical loop

```bash
agent-device open MyApp --platform ios
agent-device logs clear --restart
agent-device network dump 25
agent-device logs path
agent-device close
```

## Log and network flow

Logging is off by default. Enable it only when you need a debugging window.

- Default app logs live under `~/.agent-device/sessions/<session>/app.log`.
- `logs clear --restart` is the fastest clean repro loop.
- `network dump [limit] [summary|headers|body|all]` parses recent HTTP(s) entries from the same session app log.
- On macOS, `network dump` is app-scoped and only sees Unified Logging associated with the active session app.
- On iOS simulators, `network dump` can recover recent app log history with `simctl log show` when the live session stream is sparse, so check the returned notes before assuming the repro window was empty.
- On iOS, `network dump` is still limited to what Unified Logging exposes for the app process. If the app does not emit request metadata there, `network dump` can legitimately return no HTTP entries even during a real repro.
- Summary output already shows timestamp, status, and duration when the log backend exposes them.
- Prefer the explicit flag form `network dump 25 --include headers|body|all` when you need more than the default summary view.
- If iOS simulator notes say app logs were recovered but none looked like HTTP traffic, treat that as an app instrumentation gap rather than a missing repro and inspect `logs path` for the non-network diagnostics that were captured.
- `logs doctor` checks backend and runtime readiness for the current session and device.
- `logs mark "before tap"` inserts a timestamped marker into the app log.
- Android `network dump` surfaces timestamps from logcat-style prefixes and can backfill status and request/response duration from adjacent GIBSDK packet lines, so check it before dumping raw log windows.
- Android app-log streaming rebinds to the current app PID after relaunches, so rerun the repro window before assuming the last log slice is stale.
- Marker lines are emitted with the `[agent-device][mark][...]` prefix. When you grep later, prefer a narrow pattern such as `grep -n -E "agent-device.*mark|before tap" <path>`.
- Session app logs can contain runtime data, headers, or payload fragments. Review them before sharing.
- `logs start` requires an active app session and appends to `app.log`.
- `logs stop` stops streaming. `close` also stops logging.
- `logs clear` truncates `app.log` and removes rotated `app.log.N` files, and requires logging to be stopped first.
- `logs path` returns the log path plus metadata about the active backend and file state.
- `network log` is an alias for `network dump`.

Operational limits:

- `app.log` rotates to `app.log.1` after 5 MB by default.
- `network dump` scans the last 4000 app-log lines, returns up to 200 entries, and truncates header or payload fields at 2048 characters.
- Retention knobs:
  - `AGENT_DEVICE_APP_LOG_MAX_BYTES`
  - `AGENT_DEVICE_APP_LOG_MAX_FILES`
- Redaction hook:
  - `AGENT_DEVICE_APP_LOG_REDACT_PATTERNS`

Useful shell follow-up after `logs path`:

```bash
grep -n -E "Error|Exception|Fatal|crash" <path>
grep -n -E "agent-device.*mark|before tap" <path>
tail -50 <path>
```

If the app showed a visible warning or error overlay during the flow:

- Prefer a narrow grep window around your `logs mark` lines instead of loading the whole file.
- Mention the surfaced warning or error in the final summary even if it did not block completion.
- If the overlay kept returning, call that out as a stability issue instead of treating it as operator noise.

## Alerts and permissions

Use `alert` for iOS simulator permission dialogs and macOS desktop alerts instead of tapping coordinates.

```bash
agent-device alert wait 5000
agent-device alert accept
```

- `alert` is supported on iOS simulators and macOS desktop targets.
- `alert accept` and `alert dismiss` retry internally for a short window, so you usually do not need manual sleeps.
- If a permission sheet or modal is visible in `snapshot` or `screenshot` but `alert accept` says no alert was found, treat it as normal tappable UI for that run: take a scoped `snapshot -i -s "<visible label>"` and `press @ref` instead of looping on `alert`.
- iOS 16+ "Allow Paste" prompts are suppressed under XCUITest. Use `xcrun simctl pbcopy booted` when you need to seed simulator clipboard content directly.

## Setup problems worth recognizing early

- iOS snapshots do not require macOS Accessibility permissions.
- iOS physical-device XCTest setup does require valid signing and provisioning.
- If physical-device runner setup fails, prefer Xcode Automatic Signing first.
- Optional overrides are:
  - `AGENT_DEVICE_IOS_TEAM_ID`
  - `AGENT_DEVICE_IOS_SIGNING_IDENTITY`
  - `AGENT_DEVICE_IOS_PROVISIONING_PROFILE`
  - `AGENT_DEVICE_IOS_BUNDLE_ID`
- If daemon startup is timing out during setup, increase `AGENT_DEVICE_DAEMON_TIMEOUT_MS`.
- If daemon startup fails with stale metadata hints, clean `~/.agent-device/daemon.json` and `~/.agent-device/daemon.lock`, then retry.
- Free Apple Developer personal-team accounts may reject generic bundle IDs. Use a unique reverse-DNS value for `AGENT_DEVICE_IOS_BUNDLE_ID` when that happens.

## Common failure patterns

- `snapshot` returns 0 nodes: the app may no longer be foregrounded or the UI is not stable yet. Re-open the app or retry when state settles.
- Logs are empty: confirm you opened an app session before `logs clear --restart`.
- Android logs look stale after relaunch: retry the repro window after the process rebinds.
- Android accessibility snapshots can lag behind visible screen transitions. The next snapshot now retries briefly after navigation-sensitive actions, but if the tree still looks stale, use `screenshot` as visual truth, wait briefly, then re-run `snapshot -i`.
- React Native dev warnings or errors keep reappearing: treat them as part of the app state, not as disposable chrome. Capture one clean repro and include them in the summary.
- Permission prompts block the flow: wait for the alert and handle it explicitly.
- If snapshots keep returning 0 nodes on an iOS simulator, restart Simulator and re-open the app.
- If a macOS snapshot looks incomplete, compare with `snapshot --raw --platform macos` to separate collector filtering from missing AX content.

## Crash triage fast path

Always start from the session app log, then branch by platform.

```bash
agent-device logs path
grep -n -E "SIGABRT|SIGSEGV|EXC_|fatal|exception|terminated|killed|jetsam|memorystatus|FATAL EXCEPTION|Abort message" <path>
```

- iOS: if the log suggests `ReportCrash`, `SIGABRT`, or `EXC_*`, inspect `~/Library/Logs/DiagnosticReports`.
- Android: if the app log is not enough, use `adb logcat` for `FATAL EXCEPTION`, `Abort message`, or `signal` lines around process death.
- If no crash signature appears in app logs, stop collecting broad logs and switch to the platform-native crash source.

## When to leave this file

- Return to [exploration.md](exploration.md) once the app is stable again.
- Load [verification.md](verification.md) if you need evidence artifacts after reproducing the issue.
