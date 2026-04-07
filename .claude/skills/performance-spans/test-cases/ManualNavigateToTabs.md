---
name: ManualNavigateToTabs
span_prefix: ManualNavigate
iterations: 20
warmup_iterations: 2
wait_ms: 3000
---

## Overview

This test case measures **two spans in a single run** by alternating between the Inbox and Reports tabs:

| Tap direction | Span measured |
|---------------|---------------|
| Inbox → Reports tab | `ManualNavigateToReports` |
| Reports → Inbox tab | `ManualNavigateToInboxTab` |

Each full iteration (one round-trip) produces **two spans**. With `iterations: 20`, expect ~10 spans per span type (20 taps alternating).

## Setup

1. Ensure the app is open and the user is logged in.
2. Navigate to the **Inbox** tab (second tab in the bottom tab bar) so the first tap goes to Reports.
3. Confirm the inbox screen is visible before starting.

## Tab bar coordinates (iOS iPhone 16 simulator)

| Tab | x | y |
|-----|---|---|
| Home | 40 | 815 |
| Inbox | 121 | 815 |
| Reports | 197 | 815 |
| Workspaces | 277 | 815 |
| Account | 358 | 815 |

**Android**: Take a `screenshot` first to identify tab bar y coordinate for your emulator skin.

## Warmup (repeat `warmup_iterations` times, discard results)

Tap Reports tab → wait 2s → tap Inbox tab → wait 2s. Do **not** start the CDP logger yet.

## Trigger (repeat `iterations` times)

Each iteration alternates direction:

- **Odd iterations (1, 3, 5, …)** — tap the **Reports** tab:
  ```
  agent-device tap --x 197 --y 815 --platform <platform> --device "<DeviceName>"
  ```
  This starts `ManualNavigateToReports` span (the Search/Reports tab was tapped while on Inbox).

- **Even iterations (2, 4, 6, …)** — tap the **Inbox** tab:
  ```
  agent-device tap --x 121 --y 815 --platform <platform> --device "<DeviceName>"
  ```
  This starts `ManualNavigateToInboxTab` span (the Inbox tab was tapped while on Reports).

Steps per iteration:
1. Insert a log marker: `logs mark "iter-N-start"`.
2. Tap the appropriate tab (Reports or Inbox based on parity).
3. Wait `wait_ms` milliseconds for the span to fire.
4. Insert a log marker: `logs mark "iter-N-done"`.

After `iterations` taps the sequence is: Reports, Inbox, Reports, Inbox, …

## Parsing

After the loop, grep for **each span separately**:

**ManualNavigateToReports:**
```
ManualNavigateToReports.*Ending span \(([0-9]+)ms\)
```

**ManualNavigateToInboxTab:**
```
ManualNavigateToInboxTab.*Ending span \(([0-9]+)ms\)
```

Expect ~10 results per span (with `iterations: 20`).

**Warm vs cold distinction**: The span has an `isWarm` attribute but the duration is logged regardless. The first tap (cold, page not yet mounted) will be slower than subsequent taps (warm, page cached). Warm/cold breakdown is visible in Sentry attributes but both appear in the log; compute stats across all samples.

## Notes

- `ManualNavigateToReports` starts in `SearchTabButton.tsx:42` — only fires when tapping the tab **from a different tab**. Tapping the same tab while already on it does NOT start the span.
- `ManualNavigateToInboxTab` starts in `NavigationTabBar/index.tsx:101` — same guard applies.
- Both spans end when the target screen finishes rendering (LHN `onLayout` for Inbox; Search skeleton/content for Reports).
- If the device is on the Reports tab and you tap Reports again, no span fires. The alternating pattern ensures this never happens.
