---
name: ManualSendMessage
span_prefix: ManualSendMessage
iterations: 20
warmup_iterations: 2
wait_ms: 5000
---

## Setup

1. Ensure the app is open and the user is logged in.
2. **Select the target report**: Either use the report already open on screen, or open the first non-Concierge item in the Inbox list.
   - If a report is already open and it is not Concierge, use it.
   - Otherwise: navigate to Inbox, take `snapshot -i`, find the first `[button]` with label > 40 chars that does **not** contain "Concierge", and open it.
3. **Critical**: The span only starts if the compose box is **scrolled to bottom**. Scroll to the bottom of the report before starting: `agent-device scroll --direction down --amount 5000 --platform <platform> --device "<DeviceName>"`.
4. Confirm the compose box (text input) is visible at the bottom of the screen.

**Stay on the same report for all iterations** — do not navigate between reports.

## Warmup (repeat `warmup_iterations` times, discard results)

1. Tap the compose box to focus it.
2. Type a short message: `agent-device type "warmup" --platform <platform> --device "<DeviceName>"`.
3. Press Send (submit the message).
4. Wait 4000ms.

Do **not** start the CDP logger yet.

## Trigger (repeat `iterations` times)

1. Ensure scroll position is at the bottom. If in doubt, scroll down: `agent-device scroll --direction down --amount 2000`.
2. Take `snapshot -i` to verify compose box is visible.
3. Focus the compose box: tap the text input ref from the snapshot, or tap the center-bottom of the compose area.
4. Type a short test message (vary slightly to avoid deduplication):
   ```
   agent-device type "perf test <I>" --platform <platform> --device "<DeviceName>"
   ```
5. Insert a log marker: `logs mark "iter-N-send"`.
6. Press the Send button ref from snapshot (look for `[button] "Send"` or the submit ref).
7. Wait `wait_ms` milliseconds for the message to appear and the span to end.
8. Insert a log marker: `logs mark "iter-N-done"`.

**Do not navigate away between iterations** — stay on the same report.

## Parsing

After the loop, grep the output log for lines matching:

```
ManualSendMessage.*Ending span \(([0-9]+)ms\)
```

The span ID includes the optimistic report action ID (`ManualSendMessage_<ID>`), so match on the prefix only.

Expect one span per iteration. Discard any spans before the first `iter-1-send` marker.

## Notes

- **Scroll-to-bottom guard**: The span only starts in `ReportActionCompose.tsx` when `isScrolledToBottom` is true (scroll offset < ~50px threshold). If the compose box is not at the bottom, no span fires. Always scroll to bottom before the first iteration and before the warmup.
- **Span end**: `TextCommentFragment.tsx` ends the span when the optimistic message mounts. The span measures compose → visible new message.
- **Optimistic ID**: The span start stores the optimistic report action ID; `TextCommentFragment` matches it when mounting. The match works even if the actual server ID is different.
- **Concierge exclusion**: Concierge is a bot and may respond, adding noise. Use any direct message or workspace room instead.
- **Web**: The same span fires on web. The compose box is always visible; no scroll guard issues in practice. The `isScrolledToBottom` check uses the same threshold.
- **Multiple spans per send**: Background message refreshes can emit additional spans. Take only the first `Ending span` that appears after each `iter-N-send` marker.
