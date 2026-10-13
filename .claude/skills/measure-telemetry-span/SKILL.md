---
name: measure-telemetry-span
description: Use when measuring a Sentry performance span locally with an agent-device replay flow on iOS simulator or Android emulator.
argument-hint: "<span-name> [runs] [platform] [--boot]"
allowed-tools: Bash(.claude/skills/measure-telemetry-span/measure.sh) Read Grep Glob
---

# Measure Telemetry Span

**Pattern:** from repo root, run one command with a span name and platform → stdout is a small summary table (avg / min / max + sample ms list). The script measures whatever Git checkout is currently active: it never runs `git checkout` or otherwise switches branches. To compare this branch with `main` (or any other revision), check out each commit/branch in turn—or use two worktrees/clones—and run `measure.sh` separately, then compare the two printed summaries.

## Layout

```
measure-telemetry-span/
├── measure.sh                        # the runner
├── flows/                            # one .ad flow per measured journey
└── scripts/replay-with-deadline.mjs  # wall-clock deadline around `agent-device replay`
```

Each flow under `flows/` declares the spans it owns with `# @span <SpanName>` and names the span the runner looks up. Flows here do not own application lifecycle, so they are not inputs for `agent-device test`; the runner opens the app and prepares the session.

Setup and navigation helpers live in `.claude/skills/agent-device/flows/macros/`, and `@reset` headers point at them. The `.ad` metadata spec, selector rules, and recording workflow live in [`agent-device/flows/README.md`](../agent-device/flows/README.md) — read it before adding or healing a flow here.

## Command

```bash
.claude/skills/measure-telemetry-span/measure.sh <span-name> [runs] [platform] [--boot]
```

| Argument       | Default | Description                                                                 |
| -------------- | ------- | --------------------------------------------------------------------------- |
| `<span-name>`  | —       | Must match `# @span <span-name>` on a flow under `.claude/skills/measure-telemetry-span/flows/`. |
| `[runs]`       | `10`    | Measured replays after **one** warmup inside the script.                    |
| `[platform]`   | `ios`   | `ios` or `android` — must match the simulator/emulator you use.          |
| `--boot`       | off     | Before `open`, runs `agent-device boot --platform <platform>` so a simulator/emulator is started when nothing was connected (`adb devices` empty, etc.). |

To pick a **specific** Android AVD or iOS simulator, use the same global flags `agent-device` already supports (for example `--device "Pixel_7_API_34"`) on **`boot`** and on later commands — either run `agent-device boot --platform android --device "…"` yourself before `measure.sh`, or rely on `agent-device` config (`~/.agent-device/config.json`). `--boot` inside this script only passes `--platform` through to `boot`.

**Environment:** `APP_ID` overrides the app bundle (default `com.expensify.chat.dev`). `REPLAY_TIMEOUT_MS` sets the per-replay wall-clock deadline and defaults to `120000`. The repository wrapper enforces it outside the Agent Device daemon and exits with code 124 on timeout, including on Agent Device 0.20.1 through 0.20.6 where the CLI timeout can leave the request running. `AGENT_DEVICE_STATE_DIR` selects the isolated session directory and defaults to `$HOME/.agent-device-expensify-headless`; do not point it at an interactive daemon because timeout cleanup stops that daemon. If the scenario declares `# @param KEY …`, set **`AD_KEY`** to pass `-e KEY=VALUE` to replay.

**Output:** table + `Samples: …ms` line; stderr has progress (`Using flow:`, runs, optional reset).

## Before you run

| Must have | Notes |
| --------- | ----- |
| `agent-device` (global install, version per repo agent-device skill) | |
| Metro on **8081** (`npm run start`) | |
| Dev build on device | |
| **iOS** | `agent-device react-devtools` attached so Hermes `console.debug` reaches logs. |
| **Android** | Span line visible in `adb logcat` at debug once you verify manually. |

If you see **no Android device** (`adb devices` empty): append **`--boot`** to the measure command, or run manually first:

`agent-device boot --platform android` (optional `--device "<AVD name>"`). For iOS, `agent-device boot --platform ios` or `agent-device ensure-simulator --boot` when you need a created simulator instance.

## Platform coverage

The bottom tab items carry no unique selector on either native platform, so the three flows that must press a tab (`switch-home-to-inbox`, `switch-home-to-reports`, and the `switch-to-home` reset macro) can fail to resolve a single target.

On narrow layouts the app renders two `NavigationTabBar` instances at once: one from `TabNavigatorBar` and a second from `TabBarBottomContent`, which `HomePage` and `BaseSidebarScreen` pass as `bottomContent` for the swipe-back animation. Both copies sit at the same rect and both are hittable, so `label="Inbox"` matches four nodes and `label="Inbox" hittable=true` still matches two. On iOS the tab items additionally carry no `role="tab"`, because React Native maps that role to no iOS accessibility trait. Newer Agent Device versions reject an ambiguous `press` outright, which is the correct outcome but means these three flows cannot run as written.

Every other flow here asserts its start screen with a screen-scoped `id=` and never presses a tab, so they are unaffected. Making the three tab flows durable needs a `testID` on each tab item in the app.

## Contract

- App logs: `[Sentry][<SpanName>] Ending span (<N>ms)` via `console.debug`.
- Flow file includes `# @span <SpanName>` (same name, case-sensitive). A flow may declare several spans when one journey emits a whole chain.
- Exactly one flow owns each span. The runner fails instead of choosing by filesystem order, so a flow that merely passes through a span must not declare it.
- Optional flow headers: `@reset <path.ad>` (run before the warmup and after every replay; if absent, the script relaunches the app instead so each run starts from `@pre`); `@param` keys overridable via `AD_*` (passed as `-e KEY=VALUE` to replay).
- The runner re-checks every `@pre` before and every `@post` after each replay, independently of the assertions in the flow body. Selectors carrying an unresolved `${KEY}` are skipped and logged. This is a backstop against a flow whose headers and body have drifted, not a licence to omit the body assertions.
- Each replay must emit a new span line. The runner fails on the first replay that does not, and prints the current screen. A replay can pass every step and still emit nothing - pressing a tab the app already sits on short-circuits before the span starts - so a `@pre` that cannot distinguish the start screen from the destination turns a broken run into a silent one.
- **Parsing:** stats take the **last** `RUNS` matching log lines from the capture. That matches one sample per measured replay only if each replay emits **one** such line for this span name. Extra matches (duplicate logs, nested/sub-spans with the same message pattern, noisy startup logging) can shift which samples are included—fix the app logging or tighten the grep if that happens.

## `@reset` and loop stability

`measure.sh` replays the **same** flow every iteration. Treat `@reset` as “return to a known anchor,” not a second copy of the whole flow:

- Prefer a **short** reset flow (tabs to Inbox, dismiss sheet, etc.). Point `@reset` at a **macro** path so one file stays the source of truth.
- **Declare `@reset` whenever you can.** Without it the runner relaunches the app between runs, which is slow and puts the first post-launch navigation inside the measured loop — on Android that navigation is where the app raises a LogBox that aborts the transition. With `@reset` the runner attaches to the running app and never relaunches.
- If runs are flaky locally but fine for others, walk the bring-up checklist in `.claude/skills/agent-device/SKILL.md` (Metro, dev build, device boot, iOS + DevTools for `console.debug`) before blaming selectors.

Optional: keep a tiny markdown table in your team notes mapping `SpanName` → one-line intent + `@pre` anchor; the span name still drives which `.ad` is picked — no need to repeat long repro prose in every chat.

## Single replay without measuring

To debug one flow, or to run it as a QA check, open a session in the isolated state directory and drive the same wrapper `measure.sh` uses:

```bash
export AGENT_DEVICE_STATE_DIR="$HOME/.agent-device-expensify-headless"
agent-device open <app-id> --platform <ios-or-android> --session <name>
node .claude/skills/measure-telemetry-span/scripts/replay-with-deadline.mjs \
    .claude/skills/measure-telemetry-span/flows/<name>.ad \
    --session <name> \
    --timeout 120000 \
    -e KEY=VALUE
```

Always keep a separate `AGENT_DEVICE_STATE_DIR` for this: on timeout the wrapper stops the daemon owning that directory, and pointing it at an interactive session would kill that session.

Stop after the first failed replay or postcondition. Retry only after an explicit reset or another verified state change — replaying the same flow against unchanged state proves nothing.

## If something fails

| Symptom | Action |
| ------- | ------ |
| `No captured runs` | iOS: DevTools. Android: log level / package. Retry after clearing log pipeline. |
| `SESSION_NOT_FOUND` / empty `adb devices` | Confirm `AGENT_DEVICE_STATE_DIR` matches the directory used to open the session — `agent-device session state-dir` prints the effective one, and each state directory runs its own daemon with its own sessions. Then use **`--boot`** or `agent-device boot --platform android|ios` if no device is connected, and reopen the app if needed. |
| Fewer samples than `runs` | Span not emitted or flow flaky — `agent-device replay <flow> --debug`; fix selectors (`ad-flow-author`). |

For another app bundle, export `APP_ID` before the command.
