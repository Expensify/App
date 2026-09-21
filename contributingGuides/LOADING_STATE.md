# Deriving Loading State From the Request Queue

## Overview

A request-driven loading user interface, such as a skeleton or spinner, answers one question: **is the request that the user is waiting for still pending?** For a WRITE command, read that answer from the request queue through a public loading hook. Do not add another stored boolean for a skeleton.

This page describes two patterns:

- WRITE commands, meaning anything sent through `API.write`, use the queue-backed hooks in `src/hooks/useInFlightRequests.ts`. Every `API.write` call reaches the queue.
- Everything else stays out of the queue, including `API.read` and `API.makeRequestWithSideEffects`, whose commands can still mutate data. Search records `loading`, `loaded`, or `error` on its snapshot instead.

The queue is the primary signal, but it is not the only input. `OpenApp` and `OpenReport` leave the queue before their deferred Onyx updates, which are Onyx writes held for a later flush, finish. The public hooks bridge that short window with the loading field on the key and an in-memory value called a latch. The latch remembers that the current app process observed the request. Loading fields on the key also serve cold-start recovery, report positioning, navigation guards, and other non-skeleton behavior.

Search and the remaining app and report skeleton consumers use these patterns. The migration does not remove all legacy loading fields.

For the queue itself, see [SequentialQueue](SEQUENTIAL_QUEUE.md). For offline behavior, see [Offline UX Patterns](philosophies/OFFLINE.md).

## Contents

- [The problem: stored loading flags drift](#the-problem-stored-loading-flags-drift)
- [The pattern: derive pending from the queue](#the-pattern-derive-pending-from-the-queue)
- [The deferred-update bridge](#the-deferred-update-bridge)
- [Adding a new pending group](#adding-a-new-pending-group)
- [The invariant: only WRITE commands](#the-invariant-only-write-commands)
- [The READ-command exception: Search](#the-read-command-exception-search)
- [Choosing between the two approaches](#choosing-between-the-two-approaches)
- [Migration discipline](#migration-discipline)

## The problem: stored loading flags drift

The historical pattern stores a boolean next to the data. The action sets it to `true` before sending a request and clears it after the request settles. Examples include `IS_LOADING_APP` (`ONYXKEYS.IS_LOADING_APP`), `account.isLoading`, `isLoadingInitialReportActions` in `src/types/onyx/ReportLoadingState.ts`, and the legacy `search.isLoading` field. Screens sometimes also treat a missing value, such as `data === undefined`, as "still loading."

A stored boolean can stop matching the request:

- A reload, crash, or dropped response can happen before the clearing write. The next process can then read `true` without having the request that set it.
- A check such as `data === undefined` cannot distinguish a pending request from a successful empty response.

A serializable WRITE request appears in `PERSISTED_REQUESTS` while it waits and in `PERSISTED_ONGOING_REQUESTS` while the queue processes it. Persisted requests can survive a restart through [Restart Recovery](SEQUENTIAL_QUEUE.md#restart-recovery). Requests containing `File` or `Blob` values cannot be persisted. While such a request runs it is already out of `PERSISTED_REQUESTS` and `PERSISTED_ONGOING_REQUESTS` is set to `null`, so a queue-backed hook reports not pending. Do not derive an upload spinner from the queue. The queue removes a request when it settles. For `OpenApp` and `OpenReport`, this happens just before deferred Onyx updates finish, so the public hooks cover that short gap as described below.

## The pattern: derive pending from the queue

For loading driven by a **WRITE** command, use a dedicated hook from `src/hooks/useInFlightRequests.ts`. Do not read raw queue entries in a screen, and do not add a new loading flag for the skeleton.

Each hook maps to a **group**, which means a set of API commands that count as pending for one use case. Every group reads the two queue keys, `ONYXKEYS.PERSISTED_REQUESTS` and `ONYXKEYS.PERSISTED_ONGOING_REQUESTS`, with selectors that return booleans. The public API is one hook per group:

- `useIsAppLoadPending()`: an `OpenApp` request or its deferred updates are pending.
- `useIsReportLoadPending(reportID)`: an `OpenReport` or its deferred updates are pending for that report.
- `useIsLoadingBarPending()` / `useLoadingBarVisibility()`: a command relevant to the top-of-screen loading bar is active. Persisted requests that started offline are excluded, and the visible bar also requires the app to be online.

The screen still decides what to render. It can combine the hook result with offline state, cached-data readiness, or first-load state. For example:

```tsx
// WorkspacesListPage.tsx
const {isOffline} = useNetwork();
const isAppLoadPending = useIsAppLoadPending();
const shouldShowLoadingIndicator = isAppLoadPending && !isOffline;

// ...
{shouldShowLoadingIndicator ? (
    <ActivityIndicator />
) : (
    <WorkspaceListTable workspaces={workspaceRows} />
)}
```

The request remains pending while offline, but a full-page loader cannot finish until the app reconnects. The screen therefore suppresses this loader and shows cached data. Keep this presentation choice at the call site.

## The deferred-update bridge

`SequentialQueue` removes a settled `OpenApp` or `OpenReport` from both queue keys before it flushes deferred Onyx updates. Queue presence alone would become `false` too early. A skeleton could disappear while old account or report data is still visible.

The existing public hooks bridge this window:

- `useIsAppLoadPending()` reads the two queue keys and `ONYXKEYS.IS_LOADING_APP`. An in-memory latch starts only after this process observes `OpenApp` in the queue. It stays set until the deferred update clears `IS_LOADING_APP`.
- `useIsReportLoadPending(reportID)` reads the two queue keys and that report's `RAM_ONLY_REPORT_LOADING_STATE`. An in-memory set records report IDs observed with a matching `OpenReport`. It removes a report ID after `isLoadingInitialReportActions` clears.

A fresh process does not inherit either latch. A stranded legacy loading value cannot make either hook pending by itself.

Each hook creates exactly three Onyx subscriptions while this bridge exists:

- `useIsAppLoadPending()` creates two queue subscriptions and one `IS_LOADING_APP` subscription.
- `useIsReportLoadPending()` creates two queue subscriptions and one report loading-state subscription.

Do not call these hooks once per list row. Read the hook at screen or list level and pass the boolean down.

## Adding a new pending group

New groups are declared in the `PENDING_REQUEST_GROUPS` registry in `useInFlightRequests.ts`. A group config has one required field and two optional ones:

```ts
const PENDING_REQUEST_GROUPS = {
    // Unscoped: matches on command alone.
    appLoad: {
        commands: new Set<string>(APP_LOAD_COMMANDS), // WRITE_COMMANDS.OPEN_APP
    },
    // Scoped: only requests whose scope key equals the caller's scope key match.
    reportLoad: {
        commands: new Set<string>(REPORT_LOAD_COMMANDS), // WRITE_COMMANDS.OPEN_REPORT
        getScopeKey: (request) => (typeof request.data?.reportID === 'string' ? request.data.reportID : undefined),
    },
    // ignoreOfflineInitiatedPersisted: drop requests enqueued while offline.
    loadingBar: {
        commands: new Set<string>(LOADING_BAR_COMMANDS),
        ignoreOfflineInitiatedPersisted: true,
    },
} satisfies Record<string, PendingRequestGroupConfig>;
```

- **`commands`** (required): the WRITE commands whose presence in the queue counts as "pending" for this group. The backing arrays are typed `WriteCommand[]` (see the invariant below).
- **`getScopeKey`** (optional): for scoped groups, extracts a scope key from a request so a caller sees only the requests it cares about (e.g. the `OpenReport` for one `reportID`). Omit it for groups that match on command alone. Callers should pass a defined scope key. An undefined request scope can only equal an undefined caller scope.
- **`ignoreOfflineInitiatedPersisted`** (optional): when `true`, persisted requests initiated while offline are ignored, because they sit in the queue until reconnect and should not read as "loading." This filter applies to the persisted queue only, never to the ongoing request. `useLoadingBarVisibility` uses it so the bar does not show for work that is parked offline.

Then add a dedicated hook that wraps the internal generic with the group name (and scope key, if any). The generic stays internal so a call site cannot pass the wrong scope key for a group.

The `appLoad` group contains `OpenApp` only, **not** `ReconnectApp`. It models the `OpenApp` loading state that skeleton consumers historically read from `IS_LOADING_APP`. Including `ReconnectApp` would make full-page loaders appear during background reconnects, while coming back online or filling an update gap. The loading bar is a separate group that includes `ReconnectApp`. When you define a group, match the exact commands that the existing user interface treated as loading.

## The invariant: only WRITE commands

**A group may contain WRITE commands only.** This is a correctness rule.

Only WRITE commands are pushed to the SequentialQueue (see `processRequest` in `src/libs/API/index.ts`). `API.read` and `API.makeRequestWithSideEffects` run straight through the middleware chain and are **never** written to `PERSISTED_REQUESTS` / `PERSISTED_ONGOING_REQUESTS` (see [where a request does not hit disk](SEQUENTIAL_QUEUE.md#where-the-request-actually-hits-disk-and-where-it-doesnt)). A hook that watched the queue for a READ or side-effect command would return `false` while the request runs. The skeleton would never show.

The registry encodes this in the type system rather than relying on a comment: each command list is typed `WriteCommand[]`, so a READ command in a group is a compile error. Keep it that way.

"WRITE" means the API function, not whether the command changes server data. `SIDE_EFFECT_REQUEST_COMMANDS` in `src/libs/API/types.ts` holds mutating commands such as `LockAccount`, `SetVacationDelegate`, and `CompleteGuidedSetup`. They go through `API.makeRequestWithSideEffects` because the caller needs the response, so they never reach the queue and cannot back a queue-derived skeleton. Use the terminal-state pattern for them.

## The READ-command exception: Search

Search is a **READ** command. Its request never enters the queue, so a queue-backed hook cannot observe it. Search records the request lifecycle on the matching snapshot.

Search stamps an explicit **terminal lifecycle state** on the snapshot it is loading. A terminal state means the request has ended as `loaded` or `error`. `CONST.SEARCH.SNAPSHOT_STATE` defines `loading`, `loaded`, and `error` on the `state` field of the snapshot's `search` info (see `SearchResultsInfo` in `src/types/onyx/SearchResults.ts`). `getOnyxLoadingData` in `src/libs/actions/Search.ts` owns these changes:

- `optimisticData` writes `state: loading` when the request starts.
- `successData` writes `state: loaded`, plus the query type and hash, for a `200` response. This also covers a successful response with no snapshot data, so the page can show an empty result.
- `failureData` writes `state: error` for a failed response.
- `search()` applies `failureData` when the network promise rejects before there is an HTTP response.
- `finallyData` clears the legacy `isLoading` field but does not write `state`. It runs after success or failure and must not replace the terminal state.

A `460` response is an exception. `applyHTTPSOnyxUpdates` skips `failureData` for `460`, and nothing else applies it, so the snapshot keeps `state: loading` while `finallyData` clears `isLoading`. Do not rely on `460` reaching a terminal state.

The read side uses `state` rather than only `isLoading` or the shape of `data`. A response with no rows reaches `loaded`, so it does not leave the skeleton visible. Normal failures and network rejections reach `error`.

Search re-fires only for an unresolved snapshot. `useSearchPageSetup` skips `search()` when `isSearchDataLoaded` is true, and that helper counts any non-null `data` or `errors` as resolved, not only a terminal `state`. A snapshot that holds cached data while `state` is still `loading` is therefore not restarted. `search()` also tracks active requests by query hash and offset, so a matching request that is already running is not sent twice.

## Choosing between the two approaches

| Command type | How pending is derived | Mechanism |
|---|---|---|
| WRITE (`API.write`) | Presence in the queue | A dedicated hook from `useInFlightRequests.ts` |
| READ or side-effect request | An explicit terminal state on the data | A `state` field the action stamps, as Search does |

Decide by the command type. If the request goes through `API.write`, use a queue-backed public hook. If it goes through `API.read` or `API.makeRequestWithSideEffects`, it cannot use the queue. Record an explicit terminal state as Search does. Do not add a new boolean or use `data === undefined` as the only loading signal.

## Migration discipline

Change skeleton consumers without changing unrelated behavior. Write a truth table for each consumer because the hook reports pending work, while the screen owns presentation.

The remaining initial app skeleton consumers use `HAS_LOADED_APP` to distinguish the first load from later `OpenApp` and `ReconnectApp` work:

| State | Initial app skeleton |
|---|---|
| The `HAS_LOADED_APP` value is still `false` while Onyx reads the key from storage | shown |
| `HAS_LOADED_APP` is `false` and `OpenApp` is pending | shown |
| `HAS_LOADED_APP` is `false`, and `OpenApp` left the queue before its deferred clear flushed | shown through the hook bridge |
| Cold restart, `HAS_LOADED_APP` hydrated to `false`, and `IS_LOADING_APP` is still `true` | shown through the recovery fallback |
| `HAS_LOADED_APP` is `true`, including a warm reconnect or account switch | not shown |

Keep `HAS_LOADED_APP` and the cold-restart fallback. The queue hook is the primary signal. The fallback covers a fresh process where no in-memory latch could have observed the earlier `OpenApp`. `ForYouSection` also keeps `IS_LOADING_REPORT_DATA` in its first-load gate.

Report skeleton consumers use `useIsReportLoadPending(reportID)` wherever pending `OpenReport` work is part of the loading decision. They keep existing readiness checks, including `hasOnceLoadedReportActions`, report data completeness, and offline behavior. A stranded `isLoadingInitialReportActions` value without a matching queue request or in-memory latch must not show a skeleton.

Do not remove the legacy fields as part of this migration. `IS_LOADING_APP` and report loading state still support recovery, report positioning, navigation guards, and the deferred-flush bridge. Skeleton consumers should use the public hooks. Full flag deletion is outside this plan.
