---
name: dogfood
description: 'Systematically explore and test a mobile app on iOS/Android with agent-device to find bugs, UX issues, and other problems. Use when asked to "dogfood", "QA", "exploratory test", "find issues", "bug hunt", or "test this app" on mobile. Produces a structured report with reproducible evidence: screenshots, optional repro videos, and detailed steps for every issue.'
allowed-tools: Bash(agent-device:*), Bash(npx agent-device:*)
---

# Dogfood (agent-device)

Systematically explore a mobile app, find issues, and produce a report with full reproduction evidence for every finding.

## Setup

Only the **Target app** is required. Everything else has sensible defaults.

| Parameter            | Default                                                     | Example override                             |
| -------------------- | ----------------------------------------------------------- | -------------------------------------------- |
| **Target app**       | _(required)_                                                | `Settings`, `com.example.app`, deep link URL |
| **Platform**         | Infer from user context; otherwise ask (`ios` or `android`) | `--platform ios`                             |
| **Session name**     | Slugified app/platform (for example `settings-ios`)         | `--session my-session`                       |
| **Output directory** | `./dogfood-output/`                                         | `Output directory: /tmp/mobile-qa`           |
| **Scope**            | Full app                                                    | `Focus on onboarding and profile`            |
| **Authentication**   | None                                                        | `Sign in to user@example.com`                |

If the user gives enough context to start, begin immediately with defaults. Ask follow-up only when a required detail is missing (for example platform or credentials).

Prefer direct `agent-device` binary when available.

## Workflow

```
1. Initialize    Set up session, output dirs, report file
2. Launch/Auth   Open app and sign in if needed
3. Orient        Capture initial snapshot and map navigation
4. Explore       Systematically test flows and states
5. Document      Record reproducible evidence per issue
6. Wrap up       Reconcile summary, close session
```

### 1. Initialize

```bash
mkdir -p {OUTPUT_DIR}/screenshots {OUTPUT_DIR}/videos
cp {SKILL_DIR}/templates/dogfood-report-template.md {OUTPUT_DIR}/report.md
```

### 2. Launch/Auth

Start a named session and launch target app:

```bash
agent-device --session {SESSION} open {TARGET_APP} --platform {PLATFORM}
agent-device --session {SESSION} snapshot -i
```

If login is required:

```bash
agent-device --session {SESSION} snapshot -i
agent-device --session {SESSION} fill @e1 "{EMAIL}"
agent-device --session {SESSION} fill @e2 "{PASSWORD}"
agent-device --session {SESSION} press @e3
agent-device --session {SESSION} wait 1000
agent-device --session {SESSION} snapshot -i
```

For OTP/email codes: ask the user, wait for input, then continue.

### 3. Orient

Capture initial evidence and navigation anchors:

```bash
agent-device --session {SESSION} screenshot {OUTPUT_DIR}/screenshots/initial.png
agent-device --session {SESSION} snapshot -i
```

Map top-level navigation, tabs, and key workflows before deep testing.

### 4. Explore

Read [references/issue-taxonomy.md](references/issue-taxonomy.md) for severity/category calibration.

Strategy:

- Move through each major app area (tabs, drawers, settings pages).
- Test core journeys end-to-end (create, edit, delete, submit, recover).
- Validate edge states (empty/error/loading/offline/permissions denied).
- Use `diff snapshot -i` after UI transitions to avoid stale refs.
- Periodically capture `logs path` and inspect the app log when behavior looks suspicious.

Useful commands per screen:

```bash
agent-device --session {SESSION} snapshot -i
agent-device --session {SESSION} screenshot {OUTPUT_DIR}/screenshots/{screen-name}.png
agent-device --session {SESSION} appstate
agent-device --session {SESSION} logs path
```

### 5. Document Issues (Repro-First)

Explore and document in one pass. When you find an issue, stop and fully capture evidence before continuing.

#### Interactive/behavioral issues

Use video + step screenshots:

1. Start recording:

```bash
agent-device --session {SESSION} record start {OUTPUT_DIR}/videos/issue-{NNN}-repro.mp4
```

2. Reproduce with visible pacing. Capture each step:

```bash
agent-device --session {SESSION} screenshot {OUTPUT_DIR}/screenshots/issue-{NNN}-step-1.png
sleep 1
# perform action
sleep 1
agent-device --session {SESSION} screenshot {OUTPUT_DIR}/screenshots/issue-{NNN}-step-2.png
```

3. Capture final broken state:

```bash
sleep 2
agent-device --session {SESSION} screenshot {OUTPUT_DIR}/screenshots/issue-{NNN}-result.png
```

4. Stop recording:

```bash
agent-device --session {SESSION} record stop
```

5. Append issue immediately to report with numbered steps and screenshot references.

#### Static/on-load issues

Single screenshot is sufficient; no video required:

```bash
agent-device --session {SESSION} screenshot {OUTPUT_DIR}/screenshots/issue-{NNN}.png
```

Set **Repro Video** to `N/A` in the report.

### 6. Wrap Up

Target 5-10 well-evidenced issues, then finish:

1. Reconcile summary severity counts in `report.md`.
2. Close session:

```bash
agent-device --session {SESSION} close
```

3. Report total issues, severity breakdown, and highest-risk findings.

## Guidance

- Repro quality matters more than issue count.
- Use refs (`@eN`) for fast exploration, selectors for deterministic replay assertions when needed.
- Re-snapshot after any mutation (navigation, modal, list update, form submit).
- Use `fill` for clear-then-type semantics; use `type` for incremental typing behavior checks.
- Keep logs optional and targeted: enable/read app logs only when useful for diagnosis.
- Never read source code of the app under test; findings must come from observed runtime behavior.
- Write each issue immediately to avoid losing evidence.
- Never delete screenshots/videos/report artifacts during a session.

## References

| Reference                                                    | When to Read                                    |
| ------------------------------------------------------------ | ----------------------------------------------- |
| [references/issue-taxonomy.md](references/issue-taxonomy.md) | Start of session; severity/categories/checklist |

## Templates

| Template                                                                     | Purpose                                       |
| ---------------------------------------------------------------------------- | --------------------------------------------- |
| [templates/dogfood-report-template.md](templates/dogfood-report-template.md) | Copy into output directory as the report file |
