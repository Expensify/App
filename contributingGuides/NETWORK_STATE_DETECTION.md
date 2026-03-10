# Network State Detection

## Overview

The app uses a two-layer detection model to determine connectivity status. Each layer feeds into a central **hard stop** state machine that decides whether the app is offline. When a hard stop is active, the app pauses outgoing requests and shows the offline UI. Recovery relies on NetInfo's built-in reachability polling (`isInternetReachable`) and the FailureTracker detecting a successful request. Once connectivity is confirmed, the app clears the hard stop and reconnects.

## Architecture Diagram

```
┌──────────────────────┐
│ Layer 1: OS Radio    │   NetInfo isConnected
│ (NetworkConnection)  │──────────────────────────┐
└──────────────────────┘                          │
                                                  ▼
                                        ┌──────────────────┐
┌──────────────────────┐                │                  │
│ Layer 2: Sustained   │  FailureTracker│   NetworkState   │──── isOffline ──▶ Onyx / UI
│ Failures             │───────────────▶│   (hard stop)    │
│ (FailureTracking MW) │                │                  │──── pause/unpause SequentialQueue
└──────────────────────┘                └──────────────────┘
                                               ▲
                                               │ onReachabilityRestored
                                               │
                                        ┌──────────────────┐
                                        │ NetInfo listener  │──── isInternetReachable
                                        │ (reachability     │     transitions false→true
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

Three triggers can activate a hard stop:

| Trigger | Source | Meaning |
|---|---|---|
| `noRadioActive` | OS radio detection | Device has no network interface (airplane mode, WiFi off) |
| `sustainedFailuresActive` | Failure tracker | Requests have been failing consistently |
| `shouldForceOffline` | Debug tool | Manually forced offline via TestToolMenu |

When a hard stop activates:
1. `SequentialQueue` is paused — no outgoing write requests
2. `isOffline` is set in Onyx — UI reflects offline state

When the hard stop clears:
1. `SequentialQueue` is unpaused — pending writes flush
2. `isOffline` is cleared in Onyx — UI reflects online state

## Layer 1: OS Radio Detection

**File:** `src/libs/NetworkConnection.ts`

This layer uses `@react-native-community/netinfo` to detect whether the device has an active network interface.

- A module-level Onyx connection to `SESSION` triggers `configureAndSubscribe()` whenever accountID changes
- When `isConnected` is `false`, it calls `NetworkState.setHasRadio(false)`
- When `isConnected` returns to `true`, it calls `NetworkState.setHasRadio(true)`
- Detects: airplane mode, WiFi disabled, no cellular signal
- Does **not** determine actual server reachability — a device can be connected to WiFi but have no internet

### Reachability tracking

The NetInfo listener also tracks `isInternetReachable` transitions. When `isInternetReachable` changes from `false`/`null` to `true`, it calls `NetworkState.onReachabilityRestored()` to clear the hard stop and trigger reconnection.

**Platform behavior:**
- **Mobile**: `useNativeReachability=true` (default) — NetInfo trusts native `isInternetReachable`, JS polling never starts. Recovery is detected through native state change events.
- **Web**: No native module — NetInfo uses JS fetch polling against `api/Ping`. Polls every 5s when unreachable, every 60s when reachable. Recovery detected when Ping succeeds and `isInternetReachable` flips to `true`.

## Layer 2: Sustained Failure Detection

**Files:** `src/libs/FailureTracker.ts`, `src/libs/Middleware/FailureTracking.ts`

This layer detects connectivity loss through request outcomes, catching cases where the OS reports a connection but the server is unreachable (e.g., captive portal, DNS failure, server outage).

### FailureTracking Middleware

The middleware observes every API response:

- `jsonCode === 200` → calls `recordSuccess()`
- `jsonCode >= 500` → calls `recordFailure()`
- Network errors (caught exceptions) → calls `recordFailure()`
- **Ignored:** `REQUEST_CANCELLED` and `DUPLICATE_RECORD` — these are not real connectivity failures

### FailureTracker

Counts consecutive failures and applies a dual threshold:

1. **Count threshold:** at least `SUSTAINED_FAILURE_THRESHOLD_COUNT` failures (default: 3)
2. **Time threshold:** at least `SUSTAINED_FAILURE_WINDOW_MS` elapsed since the first failure (default: 10s)

Both thresholds must be met simultaneously to trigger a sustained failure hard stop. This prevents brief transient errors from being misidentified as connectivity loss.

One successful request resets everything — it proves the server is reachable and clears the `sustainedFailuresActive` flag.

## Central State Machine

**File:** `src/libs/NetworkState.ts`

`NetworkState` is the single source of truth for offline status. It holds three module-level boolean flags:

```
noRadioActive          — set by NetworkConnection (Layer 1)
sustainedFailuresActive — set by FailureTracker (Layer 2)
shouldForceOffline     — set by debug tools
```

### Core logic

`updateState()` derives the offline status:

```typescript
const offline = noRadioActive || sustainedFailuresActive || shouldForceOffline;
```

If offline: pause `SequentialQueue`.
If online: unpause `SequentialQueue`.

### Recovery flow

`onReachabilityRestored()`:
1. Clears `noRadioActive` and `sustainedFailuresActive`
2. Calls `updateState()` (which clears the hard stop)
3. Calls `reconnect()` to sync app data

### App foreground handling

`initAppForegroundListener()` wires an `AppStateMonitor` callback:
- If in hard stop → calls `NetInfo.refresh()` to force a fresh native state fetch (bypasses stale `isInternetReachable` cache, see NetInfo issue #326)
- Always → calls `reconnect()` to catch up on missed Pusher events

## Recovery & Reconnect

**File:** `src/libs/actions/Reconnect.ts`

Called after reachability is restored or on app foreground. Handles data synchronization:

- If `isLoadingApp` is true → calls `App.openApp()` (full initial load)
- Otherwise → calls `App.reconnectApp(lastUpdateIDAppliedToClient)` (incremental sync)
- Flushes `SequentialQueue` to send any pending write requests

## Configuration Constants

All values are defined in `src/CONST/index.ts` under `CONST.NETWORK`:

| Constant | Value | Description |
|---|---|---|
| `SUSTAINED_FAILURE_THRESHOLD_COUNT` | `3` | Minimum failures before triggering sustained failure hard stop |
| `SUSTAINED_FAILURE_WINDOW_MS` | `10000` (10s) | Minimum elapsed time from first failure to trigger hard stop |

## Debug Tools

Two debug options are available via the TestToolMenu (accessible in dev builds):

- **`shouldForceOffline`**: Forces the app into a hard stop. Flows through Onyx → `NetworkConnection` → `NetworkState.setForceOffline()`. Useful for testing offline UX patterns.
- **`shouldSimulatePoorConnection`**: Randomly toggles the app between online and offline every 2–5 seconds. Handled in `NetworkConnection.ts`. Useful for testing flaky network behavior.

## Key Files Reference

| File | Role |
|---|---|
| `src/libs/NetworkState.ts` | Central hard stop state machine |
| `src/libs/NetworkConnection.ts` | OS radio detection and reachability tracking via NetInfo |
| `src/libs/FailureTracker.ts` | Counts failures, triggers sustained failure hard stop |
| `src/libs/Middleware/FailureTracking.ts` | Middleware that observes request outcomes |
| `src/libs/actions/Reconnect.ts` | Syncs app data after recovery |
| `src/libs/Network/SequentialQueue.ts` | Write request queue (paused/unpaused by hard stop) |
| `src/libs/actions/Network.ts` | Sets `isOffline` in Onyx |
| `src/hooks/useNetwork.ts` | Hook for components to read offline status |

## Relationship to Offline UX Patterns

This document covers **how** the app detects connectivity changes and determines offline status. For **how features respond** to being offline (optimistic updates, blocking forms, full-page blocking), see [Offline UX Patterns](philosophies/OFFLINE.md).
