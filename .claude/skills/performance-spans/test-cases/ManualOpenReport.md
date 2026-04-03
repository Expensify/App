---
name: ManualOpenReport
span_prefix: ManualOpenReport
iterations: 20
warmup_iterations: 2
wait_ms: 3000
---

## Setup

1. Ensure the app is open and the user is logged in.
2. Navigate to the Inbox tab. It is the second tab in the bottom tab bar (after Home).
3. Confirm at least 5 chat/report row items are visible in the list.

## Warmup (repeat `warmup_iterations` times, discard results)

Run the Trigger steps below but do **not** record any spans. This warms up JS caches and Onyx so the first measured run is not an outlier. Start the CDP logger **after** warmup completes.

## Trigger (repeat `iterations` times)

1. Take `snapshot -i` of the inbox screen.
2. Collect all `[button]` nodes whose label is **longer than 40 characters** — these are the chat/report row items. UI chrome buttons (Search, Back, FAB, tab bar items) all have short labels and are excluded by this rule.
3. Pick the item at index `(i - 1) % count` (zero-based cycling through available items).
4. Run `scrollintoview <ref>` to bring it into the viewport; use the returned `currentRef` for the press.
5. Insert a log marker: `logs mark "iter-N-open"`.
6. Press the ref.
7. Wait `wait_ms` milliseconds for the span to fire and end.
8. Insert a log marker: `logs mark "iter-N-back"`.
9. Navigate back using the `back` command.
10. Wait 1000ms before starting the next iteration.

## Parsing

After the loop, grep the output log for lines matching:

```
ManualOpenReport.*Ending span \(([0-9]+)ms\)
```

**Note**: `agent-device logs mark` writes to native iOS logging, not to the CDP/JS console. Markers will NOT appear in the log file. Use timing-based alignment instead:

1. Discard any spans that appear before the first user action (background spans emitted when CDP connects, typically 5–10 spanning the first few seconds of the log).
2. After that, there is one span per iteration (~13s apart). Take those spans in order — one per iteration.

## Notes

- A single tap can emit multiple `ManualOpenReport` spans because the app refreshes previously visited reports in the background. Only the first span after the marker is the one caused by the user action.
- The span ID format is `ManualOpenReport_<reportID>` — always match on the prefix, never the full ID.
- If fewer than 5 inbox items are visible on first snapshot, scroll down to reveal more before starting the loop.
