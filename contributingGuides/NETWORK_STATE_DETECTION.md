# Network State Detection

## Overview

The app uses a two-layer detection model to determine connectivity status. Each layer feeds into a central **hard stop** state machine that decides whether the app is offline. When a hard stop is active, the app pauses outgoing requests and shows the offline UI. Recovery relies on NetInfo's built-in reachability polling (`isInternetReachable`) and the FailureTracker detecting a successful request. Once connectivity is confirmed, the app clears the hard stop and reconnects.

## Architecture Diagram

```
┌──────────────────────┐
│ Layer 1: OS Radio    │   NetInfo isConnected
│ (NetworkState)       │──────────────────────────┐
└──────────────────────┘                          │
                                                  ▼
                                        ┌──────────────────┐
┌──────────────────────┐                │                  │
│ Layer 2: Sustained   │  FailureTracker│   NetworkState   │──── isOffline ──▶ listeners (UI, SQ)
│ Failures             │───────────────▶│   (hard stop)    │
│ (FailureTracking MW) │                │                  │
└──────────────────────┘                └──────────────────┘
                                               ▲
                                               │ onReachabilityRestored
                                               │
                                        ┌──────────────────┐
                                        │ NetInfo listener  │──── isInternetReachable
                                        │ (reachability     │     transitions →true
                                        │  polling)         │
                                        └──────────────────┘
                                               │
                                               ▼
                                        ┌──────────────────┐
                                        │    Reconnect     │──── openApp / reconnectApp
                                        │                  │──── flush SequentialQueue
                                        └──────────────────┘
```

## The Hard Stop Model

A **hard stop** means the app considers itself offline. When at least one trigger is active, the hard stop is ON. When all triggers are cleared, the hard stop is OFF.

Four triggers can activate a hard stop:

| Trigger | Source | Meaning |
|---|---|---|
| `noRadioActive` | OS radio detection | Device has no network interface (airplane mode, WiFi off) |
| `sustainedFailuresActive` | Failure tracker | Requests have been failing consistently |
| `shouldForceOffline` | Debug tool | Manually forced offline via TestToolMenu |
| `simulatedOffline` | Test tool | Poor connection simulator toggling offline randomly |

When a hard stop activates:
1. `NetworkState` notifies all subscribers (via `subscribe()`)
2. `SequentialQueue` guards against processing while offline (reads `getIsOffline()` synchronously)
3. Components using `useNetwork()` re-render with `isOffline: true`

When the hard stop clears:
1. `NetworkState` notifies all subscribers
2. `Reconnect.ts` detects the offline→online transition and calls `SequentialQueue.flush()`
3. Components using `useNetwork()` re-render with `isOffline: false`

## Layer 1: OS Radio Detection

**File:** `src/libs/NetworkState.ts`

This layer uses `@react-native-community/netinfo` to detect whether the device has an active network interface. The NetInfo listener lives inside `NetworkState.ts` — there is no separate module.

- A module-level Onyx connection to `SESSION` triggers `configureAndSubscribe()` whenever accountID changes
- The NetInfo listener reads `state.isConnected` and calls `setHasRadio()` internally
- When `isConnected` is `false` → `setHasRadio(false)` → activates the `noRadioActive` hard stop
- When `isConnected` returns to `true` → `setHasRadio(true)` → clears the `noRadioActive` hard stop
- Detects: airplane mode, WiFi disabled, no cellular signal
- Does **not** determine actual server reachability — a device can be connected to WiFi but have no internet

### Reachability tracking

The NetInfo listener also tracks `isInternetReachable` transitions. Only a `false` → `true` transition triggers `onReachabilityRestored()`. The initial event on subscribe (`undefined` → `true`) and indeterminate transitions (`null` → `true`) are **not** treated as recoveries — they indicate "we just started listening and things are fine," not an actual outage recovery. This prevents duplicate `openApp()`/`reconnectApp()` calls on boot.

**Platform behavior:**

We configure `useNativeReachability: false` so that NetInfo uses JS fetch polling (`api/Ping`) on **all platforms** instead of trusting native OS reachability. This aligns behavior across web and mobile. NetInfo's default polling intervals apply (60s when reachable, 5s when unreachable). Recovery is detected when Ping succeeds and `isInternetReachable` flips to `true`.

## Layer 2: Sustained Failure Detection

**Files:** `src/libs/FailureTracker.ts`, `src/libs/Middleware/FailureTracking.ts`

This layer detects connectivity loss through request outcomes, catching cases where the OS reports a connection but the server is unreachable (e.g., captive portal, DNS failure, server outage).

### FailureTracking Middleware

The middleware observes every API response:

- Any resolved response (server responded at all) → calls `recordSuccess()`
- `FAILED_TO_FETCH` error → calls `recordFailure()` (DNS failure, no internet, network timeout)
- `EXPENSIFY_SERVICE_INTERRUPTED` error → calls `recordFailure()` (server down: 500/502/504/520)
- All other errors (4xx, throttling, etc.) → **not tracked** as connectivity failures

### FailureTracker

Counts consecutive failures and applies a dual threshold:

1. **Count threshold:** at least `SUSTAINED_FAILURE_THRESHOLD_COUNT` failures (default: 3)
2. **Time threshold:** at least `SUSTAINED_FAILURE_WINDOW_MS` elapsed since the first failure (default: 10s)

Both thresholds must be met simultaneously to trigger a sustained failure hard stop. This prevents brief transient errors from being misidentified as connectivity loss.

One successful request resets everything — it proves the server is reachable and clears the `sustainedFailuresActive` flag.

## Central State Machine

**File:** `src/libs/NetworkState.ts`

`NetworkState` is the single source of truth for offline status. It holds module-level boolean flags and uses a subscriber pattern — components use `useNetwork()` (backed by `useSyncExternalStore`) and `SequentialQueue` subscribes via `subscribe()`. Because the state is module-level (not persisted in Onyx), each browser tab detects connectivity independently. This is intentional — each tab has its own network conditions and should evaluate them on its own.

```
hasRadio                — set by NetInfo listener (Layer 1), inverted: !hasRadio = noRadio hard stop
sustainedFailuresActive — set by FailureTracker (Layer 2)
shouldForceOffline      — set by debug tools (Onyx NETWORK key)
simulatedOffline        — set by poor connection simulator
```

### Core logic

`getIsOffline()` derives the offline status:

```typescript
const offline = !hasRadio || sustainedFailuresActive || shouldForceOffline || simulatedOffline;
```

`updateState()` notifies all subscribers when the state changes. `Reconnect.ts` subscribes and calls `SequentialQueue.flush()` on offline→online transitions. `SequentialQueue` reads `getIsOffline()` synchronously for its guard checks but does not own the transition subscription.

### Recovery flow

`onReachabilityRestored()`:
1. Sets `hasRadio = true` and `sustainedFailuresActive = false`, resets FailureTracker counters
2. Calls `updateState()` (which notifies subscribers and clears the hard stop)
3. Calls `notifyReconnectListeners()` — `Reconnect.ts` subscribes to this and triggers app data sync

### App foreground handling

`Reconnect.ts` registers an `AppStateMonitor.addBecameActiveListener` callback:
- If in hard stop → calls `NetworkState.refresh()` which triggers `NetInfo.refresh()` (bypasses stale `isInternetReachable` cache, see NetInfo issue #326)
- Always → calls `reconnect()` to catch up on missed Pusher events

## Recovery & Reconnect

**File:** `src/libs/actions/Reconnect.ts`

Subscribes to `NetworkState.onReachabilityConfirmed()` and `AppStateMonitor.addBecameActiveListener()`. Handles data synchronization:

- Skips reconnection if no active session (`currentAccountID` is undefined)
- If `isLoadingApp` is true → calls `App.openApp()` (full initial load)
- Otherwise → calls `App.reconnectApp(lastUpdateIDAppliedToClient)` (incremental sync)
- Flushes `SequentialQueue` to send any pending write requests

## Thundering Herd Protection

When the server recovers after an outage, many clients detect reachability at roughly the same time. The queue does not add an artificial delay before flushing because the architecture has three layers of natural backoff:

1. **Polling jitter** — each client's NetInfo polls `api/Ping` on its own 5-second cycle, so clients discover recovery at different times (up to 5 seconds of natural spread).
2. **Per-request exponential backoff** — if the server is still overloaded when a client flushes, `RequestThrottle` applies jittered exponential backoff (10–100 ms initial, doubling up to 30 s cap) on each failed request.
3. **Re-triggering hard stop** — if enough requests fail after recovery (3 failures over 10 seconds), `FailureTracker` puts the client back into a hard stop, preventing it from hammering the server further.

## Configuration Constants

All values are defined in `src/CONST/index.ts` under `CONST.NETWORK`:

| Constant | Value | Description |
|---|---|---|
| `SUSTAINED_FAILURE_THRESHOLD_COUNT` | `3` | Minimum failures before triggering sustained failure hard stop |
| `SUSTAINED_FAILURE_WINDOW_MS` | `10000` (10s) | Minimum elapsed time from first failure to trigger hard stop |

## Debug Tools

Two debug options are available via the TestToolMenu (accessible in dev builds):

- **`shouldForceOffline`**: Forces the app into a hard stop. Flows through Onyx → `NetworkState.setForceOffline()`. Useful for testing offline UX patterns.
- **`shouldSimulatePoorConnection`**: Randomly toggles the app between online and offline every 2–5 seconds. Handled in `NetworkState.ts`. Useful for testing flaky network behavior.

## Key Files Reference

| File | Role |
|---|---|
| `src/libs/NetworkState.ts` | Central hard stop state machine, NetInfo configuration/subscription, OS radio detection, and reachability tracking |
| `src/libs/FailureTracker.ts` | Counts failures, triggers sustained failure hard stop via listener pattern |
| `src/libs/Middleware/FailureTracking.ts` | Middleware that observes request outcomes and feeds FailureTracker |
| `src/libs/actions/Reconnect.ts` | Subscribes to reachability + foreground events, syncs app data after recovery |
| `src/libs/Network/SequentialQueue.ts` | Write request queue, reads `getIsOffline()` synchronously for guard checks |
| `src/libs/actions/Network.ts` | Onyx actions for debug flags (forceOffline, simulatePoorConnection) |
| `src/hooks/useNetwork.ts` | Hook for components — uses `useSyncExternalStore` with `NetworkState.subscribe()` |

## Relationship to Offline UX Patterns

This document covers **how** the app detects connectivity changes and determines offline status. For **how features respond** to being offline (optimistic updates, blocking forms, full-page blocking), see [Offline UX Patterns](philosophies/OFFLINE.md).
