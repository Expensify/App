---
name: performance-spans
description: Measure Sentry telemetry span durations from a running React Native or Web app via CDP. Captures console.debug output from activeSpans.ts, runs structured test cases, and computes P90/avg/max/min summary tables.
---

# performance-spans

Use this skill whenever you need to measure how long a named Sentry span takes in the Expensify app. Supports iOS simulator, Android emulator, and web browser.

## Prerequisites

The only hard requirement is that the **user is logged in** to the app before the test starts. Everything else (booting the device, opening the app, launching Chrome) is handled automatically by the skill.

## Directory layout

```
.claude/skills/performance-spans/
├── SKILL.md                   ← this file
├── scripts/
│   ├── cdp_logger.js          ← CDP WebSocket listener (iOS/Android)
│   └── web_runner.js          ← Chrome CDP runner (Web — handles navigation + capture)
└── test-cases/
    └── ManualOpenReport.md    ← one file per span under test
```

---

## Step 1 — Locate the test case

Read `.claude/skills/performance-spans/test-cases/<SpanName>.md`.

Parse the frontmatter for:
- `span_prefix` — used as `--prefix` arg and as the grep pattern
- `iterations` — how many times to trigger the action (override with `--iterations N` from the command)
- `warmup_iterations` — how many discarded runs to do before measurement starts (default 2 if not set)
- `wait_ms` — how long to wait after each trigger before going back

---

## Step 2 — Platform branch

Choose the path based on `--platform`:

| Platform | Automation | CDP source |
|----------|-----------|------------|
| `ios` (default) | `agent-device --platform ios` | Metro on port 8081 |
| `android` | `agent-device --platform android` | Metro on port 8081 |
| `web` | Chrome CDP via `web_runner.js` | Chrome on port 9222 |

---

## Steps 3–7 (iOS / Android)

### Step 3 — Boot device and open app

#### Find or boot the device

```bash
# Find the first booted device for the target platform
DEVICE=$(agent-device devices 2>&1 | grep "<platform> " | grep "booted=true" | head -1 | sed 's/ (.*//')
```

If `DEVICE` is empty, pick the preferred device and boot it:

```bash
# iOS preferred device
DEVICE="iPhone 16"
# Android preferred device
DEVICE="Pixel 9 API 36"

agent-device boot --platform <platform> --device "$DEVICE"
# Boot can take up to 60s — wait for it to complete before continuing
```

#### Open the app

```bash
agent-device open "New Expensify Dev" --platform <platform> --device "$DEVICE"
sleep 3
```

`open` is idempotent — safe to run even when the app is already in the foreground.

#### Verify Metro is reachable

```bash
curl -s http://localhost:8081/status
```

If this fails, the Metro bundler isn't running. Tell the user to start it (`npm run ios` / `npm run android`) and wait before continuing.

#### Navigate to the required screen and run warmup

Follow the **Setup** section of the test case file using `agent-device --platform <platform> --device "$DEVICE"`.

Always start with `snapshot -i` to confirm the correct screen is visible before proceeding.

Then follow the **Warmup** section (`warmup_iterations` times). Do **not** start the CDP logger yet — warmup runs heat up JS caches and Onyx.

#### Tab bar navigation — coordinate taps

Prefer **coordinate taps** over refs for the tab bar — they never go stale.

**iPhone 16 simulator:**

| Tab | x | y |
|-----|---|---|
| Home | 40 | 815 |
| Inbox | 121 | 815 |
| Reports | 197 | 815 |
| Workspaces | 277 | 815 |
| Account | 358 | 815 |

**Android emulator (Pixel 9):** Take a `screenshot` and visually identify tab bar coordinates before starting — they vary by emulator skin and screen density. Typical y is near the bottom of the screen.

If using an unknown device, always take a screenshot first and identify coordinates visually.

---

### Step 4 — Start the CDP logger

Start the logger **after warmup**:

```bash
node .claude/skills/performance-spans/scripts/cdp_logger.js \
  --prefix <span_prefix> \
  --out <output_file> \
  --metro-port 8081 &
CDP_PID=$!
sleep 2   # give the WebSocket time to connect
```

`output_file` is `/tmp/perf_spans.log` for single-branch runs, `/tmp/perf_main.log` or `/tmp/perf_branch.log` for comparisons.

Verify it connected: stderr should contain "Connected. Enabling Runtime...".

---

### Step 5 — Run the iteration loop

Follow the **Trigger** section of the test case exactly. Key rules:

- Filter inbox buttons by label length: only `[button]` nodes with labels **longer than 40 characters** are chat/report row items. UI chrome (Search, Back, FAB, tab bar) always has short labels.
- Before every `press`, run `scrollintoview <ref>` to handle off-screen items. Use the returned `currentRef`.
- **zsh arrays are 1-indexed**: use `IDX=$(( (I - 1) % COUNT + 1 ))` — NOT `IDX=$(( (I - 1) % COUNT ))`.
- `agent-device logs mark` writes to native device logging, **not** to the CDP/JS console. Markers will NOT appear in the CDP log file. Use timing-based alignment at parse time (one span per iteration, ~13s apart).
- For back navigation: find and press the `[button] "Back"` ref from a fresh snapshot. Fall back to `agent-device back` if no Back button is visible.
- Wait `wait_ms` between press and back. Wait 1000ms after back before next snapshot.

---

### Step 6 — Stop the CDP logger

```bash
kill $CDP_PID 2>/dev/null
sleep 1
```

---

### Step 7 — Parse results

```bash
strings <output_file> | grep -oE '<span_prefix>.*Ending span \([0-9]+ms\)' \
  | grep -oE '\([0-9]+ms\)' | tr -d '()ms'
```

**Important**: The CDP log will contain background spans emitted at startup (app refreshing previously viewed reports). Discard any spans that appear before the first user action. There will typically be one span per iteration; take them in order.

Then compute stats:

```python
import sys, statistics
durations = [int(x) for x in sys.stdin.read().split()]
n = len(durations)
durations_sorted = sorted(durations)
p90 = durations_sorted[int(n * 0.9)]
print(f"N:   {n}")
print(f"P90: {p90}ms")
print(f"Avg: {statistics.mean(durations):.0f}ms")
print(f"Max: {max(durations)}ms")
print(f"Min: {min(durations)}ms")
```

---

## Steps 3–7 (Web)

### Step 3 — Ensure Chrome is running with remote debugging

```bash
curl -s http://localhost:9222/json > /dev/null 2>&1
```

If that fails (Chrome not reachable on port 9222):

```bash
# Launch a dedicated Chrome instance with remote debugging.
# --user-data-dir isolates it from the user's regular Chrome profile.
open -a "Google Chrome" --args \
  --remote-debugging-port=9222 \
  --user-data-dir=/tmp/chrome-perf-test \
  "https://dev.new.expensify.com:8082/"

# Poll until Chrome is ready (up to 30s)
for i in $(seq 1 30); do
  sleep 1
  if curl -s http://localhost:9222/json > /dev/null 2>&1; then
    echo "Chrome ready after ${i}s"
    break
  fi
done
```

After Chrome opens, take a `screenshot` (via `agent-device` on the macOS desktop surface, or just proceed) to confirm the app loaded. If the user sees a login screen, ask them to log in before continuing — the test will wait.

**Note**: If Chrome was already running without `--remote-debugging-port`, the `open` command above won't add the flag to the existing instance. In that case, the poll will still fail. Tell the user:
> "Please quit Chrome and re-run — or use the already-open Chrome if it was launched with `--remote-debugging-port=9222`."

### Step 4 — Run `web_runner.js` (handles warmup + recording + navigation)

```bash
node .claude/skills/performance-spans/scripts/web_runner.js \
  --prefix <span_prefix> \
  --out <output_file> \
  --iterations <N> \
  --warmup <warmup_iterations> \
  --wait <wait_ms> \
  --chrome-port 9222
```

The script connects to Chrome CDP, runs warmup iterations (discarded), then runs measured iterations. It outputs matching span lines directly — no separate cdp_logger process needed.

### Step 5 — Parse results (same as iOS/Android)

The output file has the same format as `cdp_logger.js` output. Use the same grep + python pipeline described above.

---

## Step 8 — Output the summary table

Single-branch format:

```
## ManualOpenReport — Performance Results (ios)

| Metric | Value  |
|--------|--------|
| P90    | 1200ms |
| Avg    | 1108ms |
| Max    | 1690ms |
| Min    | 562ms  |
| N      | 20     |
```

Branch comparison format:

```
## ManualOpenReport — main vs <branch> (ios)

| Metric | main   | <branch> | delta          |
|--------|--------|----------|----------------|
| P90    | 1200ms | 950ms    | -250ms (-20.8%)|
| Avg    | 1108ms | 890ms    | -218ms (-19.7%)|
| Max    | 1690ms | 1200ms   | -490ms (-29.0%)|
| Min    | 562ms  | 480ms    | -82ms  (-14.6%)|
| N      | 20     | 20       |                |
```

Delta sign: negative = improvement (faster), positive = regression (slower).

---

## Adding new test cases

Create `.claude/skills/performance-spans/test-cases/<SpanName>.md` with the same frontmatter shape. The command and skill pick it up automatically — no other changes needed.

Available span names from `CONST.TELEMETRY` in `src/CONST/index.ts`:
- `ManualOpenReport` ✓ (defined)
- `ManualSendMessage`
- `ManualAppStartup`
- `ManualOpenCreateExpense`
- `ManualCameraInit`
- `ManualShutterToConfirmation`
- `ManualOpenSearchRouter`
- `OnyxDerivedCompute` (high-frequency, use with care)
