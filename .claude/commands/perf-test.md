---
description: Measure Sentry span performance on iOS/Android simulator or web browser. Optionally compare main vs current branch.
allowed-tools:
  - Bash(agent-device *)
  - Bash(node .claude/skills/performance-spans/scripts/cdp_logger.js *)
  - Bash(node .claude/skills/performance-spans/scripts/web_runner.js *)
  - Bash(node --version)
  - Bash(kill *)
  - Bash(sleep *)
  - Bash(strings *)
  - Bash(grep *)
  - Bash(python3 *)
  - Bash(git status)
  - Bash(git branch *)
  - Bash(git stash *)
  - Bash(git checkout *)
  - Bash(curl http://localhost:8081/*)
  - Bash(curl http://localhost:9222/*)
  - Read
  - Glob
---

# /perf-test

Measure Sentry telemetry span durations on the running app (iOS simulator, Android emulator, or web browser).

## Usage

```
/perf-test [--span <SpanName>] [--iterations <N>] [--platform <ios|android|web>] [--compare]
```

| Flag | Default | Description |
|------|---------|-------------|
| `--span` | `ManualOpenReport` | Name of the span to measure. Must match a file in `test-cases/`. |
| `--iterations` | value from test case | Override the number of iterations. |
| `--platform` | `ios` | Target platform: `ios`, `android`, or `web`. |
| `--compare` | off | Compare current branch against `main`. |

## Workflow

### 1. Parse arguments

Extract `--span`, `--iterations`, `--platform`, and `--compare` from `$ARGUMENTS`.

Defaults: span=`ManualOpenReport`, platform=`ios`.

### 2. Load the test case

Read `.claude/skills/performance-spans/test-cases/<SpanName>.md`.

If the file does not exist, list available files in the `test-cases/` directory and tell the user.

Override `iterations` if `--iterations` was passed.

### 2.5. Verify tooling

```bash
# agent-device must be installed globally (used for iOS/Android)
which agent-device || npm install -g agent-device

# node must be present (used by cdp_logger.js and web_runner.js)
node --version
```

If `agent-device` was just installed, confirm the version before continuing.

### 3. Load the performance-spans skill

Read `.claude/skills/performance-spans/SKILL.md` and follow it for all subsequent steps.

Pass `--platform` through to all skill steps so the correct automation path (agent-device vs web_runner.js) is used.

The skill handles device/browser setup automatically:
- **iOS/Android**: finds a booted device or boots one, then opens the app.
- **Web**: checks port 9222; if Chrome isn't reachable, launches it with `--remote-debugging-port=9222`. If Chrome is already running without the debug port, tells the user to restart it.

### 4a. Single-branch mode (no `--compare`)

Run the skill workflow with `--out /tmp/perf_spans.log`.

Output the summary table with the platform label in the heading, e.g. `## ManualOpenReport — Performance Results (ios)`.

### 4b. Branch comparison mode (`--compare`)

**Pre-flight check:**
```bash
git status --short
git branch --show-current
```
If there are uncommitted changes, tell the user and offer to stash (`git stash`). Do not proceed without clean state or explicit stash.

Save current branch name as `FEATURE_BRANCH`.

**Baseline — main:**
1. `git checkout main`
2. Wait for Metro to rebundle (iOS/Android only):
   - Poll `http://localhost:8081/status` every 5s up to 120s.
   - Once it returns HTTP 200, wait an additional 10s.
   - If it never returns 200 within 120s, warn the user but continue.
   - Web: no Metro poll needed — just reload the page via `Runtime.evaluate('location.reload()')` before running.
3. iOS/Android: `agent-device open "New Expensify Dev" --platform <platform> --device "<DeviceName>" --relaunch`
   Web: ask user to hard-reload the tab (Cmd+Shift+R) before proceeding.
4. Wait 3s, then confirm the app is on the home/inbox screen.
5. Run the skill workflow with `--out /tmp/perf_main.log`.

**Feature branch:**
1. `git checkout $FEATURE_BRANCH`
2. Repeat the reload/relaunch steps above.
3. Run the skill workflow with `--out /tmp/perf_branch.log`.

**Generate comparison table:**

Parse both log files and compute P90/avg/max/min for each. Then output:

```
## <SpanName> — main vs <FEATURE_BRANCH> (<platform>)

| Metric | main   | <branch> | delta           |
|--------|--------|----------|-----------------|
| P90    | Xms    | Xms      | ±Xms (±X.X%)   |
| Avg    | Xms    | Xms      | ±Xms (±X.X%)   |
| Max    | Xms    | Xms      | ±Xms (±X.X%)   |
| Min    | Xms    | Xms      | ±Xms (±X.X%)   |
| N      | X      | X        |                 |
```

Delta sign convention: negative = improvement (feature branch is faster), positive = regression.
