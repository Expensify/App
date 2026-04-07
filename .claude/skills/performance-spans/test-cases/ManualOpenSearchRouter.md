---
name: ManualOpenSearchRouter
span_prefix: ManualOpenSearchRouter
iterations: 20
warmup_iterations: 2
wait_ms: 2000
---

## Setup

1. Ensure the app is open and the user is logged in.
2. Navigate to the **Inbox** tab. Any tab works, but Inbox is the most stable baseline.
3. Confirm the bottom tab bar is visible.

## Search router button location

The magnifying glass icon is in the **top-right corner of the screen** (not the tab bar). On iPhone 16 simulator, it is approximately at:

| Button | x | y |
|--------|---|---|
| Search (magnifying glass) | 352 | 58 |

**Android / other devices**: Take a `screenshot` first to confirm coordinates. The button is in the header row near the top of the screen.

Alternatively, use a `snapshot -i` to find the `[button] "Search"` ref (short label — this is header Search, not tab bar) and press it by ref.

## Warmup (repeat `warmup_iterations` times, discard results)

1. Tap/press the Search button to open the router.
2. Wait 1500ms for the autocomplete list to render.
3. Dismiss: press `[button] "Back"` or use `agent-device back --platform <platform> --device "<DeviceName>"`.
4. Wait 500ms.

Do **not** start the CDP logger yet.

## Trigger (repeat `iterations` times)

1. Take `snapshot -i` to confirm Inbox/home screen is visible. If the router is still open, dismiss it first.
2. Insert a log marker: `logs mark "iter-N-open"`.
3. Open the search router: tap the magnifying glass button or press the `[button] "Search"` ref from snapshot.
4. Wait `wait_ms` milliseconds for the autocomplete list to render and the span to fire.
5. Insert a log marker: `logs mark "iter-N-done"`.
6. Dismiss the router: press `[button] "Back"` ref from a fresh snapshot, or `agent-device back` as fallback.
7. Wait 500ms before the next iteration.

## Parsing

After the loop, grep the output log for lines matching:

```
ManualOpenSearchRouter.*Ending span \(([0-9]+)ms\)
```

Expect one span per iteration. Discard any spans that appear before the first `iter-1-open` marker (the logger may capture background spans on connect).

## Notes

- **Span lifecycle**: Starts in `SearchButton.tsx` when the magnifying glass is tapped. Ends in `SearchAutocompleteList.tsx` via `setPerformanceTimersEnd()` when the autocomplete list mounts.
- The span is fast (typically 200–800ms) because it only measures the modal open + autocomplete render, not a full navigation.
- The keyboard shortcut (Cmd+K on desktop) also starts this span, but coordinate taps are more reliable for automated testing.
- On web, the SearchButton is always visible in the header; same span fires.
