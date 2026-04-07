---
name: ManualAppStartup
span_prefix: ManualAppStartup
iterations: 10
warmup_iterations: 0
wait_ms: 15000
---

## Setup

1. Ensure the app is open and the user is logged in.
2. No specific screen required — the span covers the full startup sequence from native init to splash hide.

**Note**: `warmup_iterations` is 0. Every cold start is a real measurement; there is no meaningful way to "warm up" this span because it requires a fresh app launch each time.

## Trigger (repeat `iterations` times)

1. Close the app completely:
   ```
   agent-device close "New Expensify Dev" --platform <platform> --device "<DeviceName>"
   ```
2. Insert a log marker: `logs mark "iter-N-open"`.
3. Launch the app:
   ```
   agent-device open "New Expensify Dev" --platform <platform> --device "<DeviceName>"
   ```
4. Wait `wait_ms` milliseconds for the app to fully start and the boot splash to hide.
5. Take a `snapshot -i` to confirm the home/inbox screen is visible.
6. Insert a log marker: `logs mark "iter-N-done"`.

**No back navigation needed** — each iteration starts from a fresh launch.

## Parsing

After the loop, grep the output log for lines matching:

```
ManualAppStartup.*Ending span \(([0-9]+)ms\)
```

**Notes on timing**:
- The span starts very early in the native boot sequence (before JS loads), so startup spans are typically 3000–12000ms.
- There will be exactly one `ManualAppStartup` span per iteration.
- Discard any span that fires before the first `iter-1-open` marker (there should be none, but guard just in case).

## Notes

- **iOS/Android only** — this span is defined in `src/setup/telemetry/index.native.ts` and has no web equivalent.
- The span optionally includes `nativeAppStartTimeMs` (time before JS engine started), so it captures the full perceived startup including native launch.
- Span ends in `onSplashHide` callback in `src/Expensify.tsx` — the moment the boot splash disappears and the app is usable.
- If the device is slow or the bundle cache is cold, startup can exceed 15s. Increase `wait_ms` if spans are missing.
