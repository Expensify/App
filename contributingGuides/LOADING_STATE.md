# Deriving Loading State From the Request Queue

## Overview

A "loading" UI (a skeleton, a spinner, a full-page loader) answers one question: **is a request the user is waiting on still in flight?** The reliable place to read that answer is the request itself, not a separate boolean stored alongside the data.

This page describes the pattern the app is moving toward: **derive "pending" from the [SequentialQueue](SEQUENTIAL_QUEUE.md), not from a stored flag.** It covers the WRITE-command case (the queue-backed hooks in `src/hooks/useInFlightRequests.ts`), the one READ-command exception (Search, which cannot use the queue and stamps an explicit terminal state on its snapshot instead), and the discipline for migrating an existing screen from a stored flag to a derived gate.

This is a how-to reference tied to a specific mechanism. For the queue it builds on, see [SequentialQueue](SEQUENTIAL_QUEUE.md). For how features behave offline, see [Offline UX Patterns](philosophies/OFFLINE.md).

## Contents

- [The problem: stored loading flags drift](#the-problem-stored-loading-flags-drift)
- [The pattern: derive pending from the queue](#the-pattern-derive-pending-from-the-queue)
- [Adding a new pending group](#adding-a-new-pending-group)
- [The invariant: only WRITE commands](#the-invariant-only-write-commands)
- [The READ-command exception: Search](#the-read-command-exception-search)
- [Choosing between the two approaches](#choosing-between-the-two-approaches)
- [Migration discipline](#migration-discipline)

## The problem: stored loading flags drift

The historical pattern stores a boolean next to the data and toggles it around a request: set it `true` before sending, set it `false` when the response resolves. Examples in the codebase include `IS_LOADING_APP` (`ONYXKEYS.IS_LOADING_APP`), `account.isLoading`, `isLoadingInitialReportActions` (in `src/types/onyx/ReportLoadingState.ts`), and `search.isLoading` on a search snapshot. Screens sometimes also infer loading from the **shape** of the data, e.g. treating `data === undefined` as "still loading."

Every one of these is a **shadow of the request queue.** The request is the real event; the flag is a hand-maintained copy of "is that request in flight." A copy has to be cleared by the exact code path that set it, and that assumption breaks in the field:

- The flag is set `true` optimistically and written to disk. A reload, a crash, or a dropped response then lands **before** the clearing write runs. On the next boot the app hydrates `true` from disk, the request that would clear it is never re-sent (or its clearing write sits in a memory-only buffer that never flushes), and the skeleton hangs forever.
- A data-shape check like `data === undefined` cannot tell "the request has not resolved yet" from "the request resolved and the result is legitimately empty." Both look identical, so a real empty result reads as permanent loading.

The queue does not drift this way. A WRITE request is in `PERSISTED_REQUESTS` / `PERSISTED_ONGOING_REQUESTS` exactly while it is pending, it survives reloads through the same persistence that makes the app offline-first, and it is removed by the queue when the request settles (see [Restart Recovery](SEQUENTIAL_QUEUE.md#restart-recovery)). Reading "pending" from the queue means the loading state cannot outlive the request that justifies it.

## The pattern: derive pending from the queue

For loading that is driven by a **WRITE** command, do not store a flag. Read a dedicated hook from `src/hooks/useInFlightRequests.ts` that reports whether a request of interest is currently in the queue.

Each hook maps to a **group**: a set of API commands whose presence in the queue means some part of the app is loading. The hook subscribes to the two queue keys (`ONYXKEYS.PERSISTED_REQUESTS` and `ONYXKEYS.PERSISTED_ONGOING_REQUESTS`) with a selector that returns a single boolean, so a consumer never touches raw request objects. The public API is one hook per group:

- `useIsAppLoadPending()`: an `OpenApp` request is in the queue (the initial app load).
- `useIsReportLoadPending(reportID)`: an `OpenReport` for that specific report is in the queue.
- `useIsLoadingBarPending()` / `useLoadingBarVisibility()`: any command relevant to the top-of-screen loading bar is in the queue.

**The presentation decision stays on the screen.** A hook reports raw pending truth. The screen decides what to render from it, and the standard shape is:

```tsx
// WorkspacesListPage.tsx
const {isOffline} = useNetwork();
const isAppLoadPending = useIsAppLoadPending();
const shouldShowLoadingIndicator = isAppLoadPending && !isOffline;

// ...
{shouldShowLoadingIndicator ? (
    <ActivityIndicator
        reasonAttributes={{context: 'WorkspacesListPage', isOffline} satisfies SkeletonSpanReasonAttributes}
    />
) : (
    <WorkspaceListTable workspaces={workspaceRows} />
)}
```

The `&& !isOffline` lives on the screen on purpose. An `OpenApp` persisted while the user is offline is genuinely still pending, but a full-page loader over it would trap an offline user behind a spinner that cannot resolve until they reconnect. The screen suppresses the loader in that case and shows whatever cached data it has, which is the offline-first behavior. Keeping the offline decision at the call site lets each screen choose its own answer while every screen shares one source of truth for "is the request in flight."

Do not call `useIsReportLoadPending` inside a list-item render path (once per row). Each call opens two Onyx subscriptions. Lift it to the screen and pass the boolean down.

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
- **`getScopeKey`** (optional): for scoped groups, extracts a scope key from a request so a caller sees only the requests it cares about (e.g. the `OpenReport` for one `reportID`). Omit it for groups that match on command alone. When it returns `undefined`, that request never matches a caller's scope key.
- **`ignoreOfflineInitiatedPersisted`** (optional): when `true`, persisted requests initiated while offline are ignored, because they sit in the queue until reconnect and should not read as "loading." This filter applies to the persisted queue only, never to the ongoing request. `useLoadingBarVisibility` uses it so the bar does not show for work that is parked offline.

Then add a dedicated hook that wraps the internal generic with the group name (and scope key, if any). The generic stays internal so a call site cannot pass the wrong scope key for a group.

Note the deliberate scoping of `appLoad`: it contains `OpenApp` only, **not** `ReconnectApp`, because it replaces the `IS_LOADING_APP` flag, which was set only for `OpenApp`. Including `ReconnectApp` would make full-page loaders appear during background reconnects (coming back online, filling an update gap), where the old flag stayed `false`. The loading bar, which does show during reconnects, is a separate group that includes `ReconnectApp`. When you define a group, match the exact command set the old flag reacted to, not a superset that seems related.

## The invariant: only WRITE commands

**A group may contain WRITE commands only.** This is a hard correctness rule, not a style preference.

Only WRITE commands are pushed to the SequentialQueue (see `processRequest` in `src/libs/API/index.ts`). `API.read` and `API.makeRequestWithSideEffects` run straight through the middleware chain and are **never** written to `PERSISTED_REQUESTS` / `PERSISTED_ONGOING_REQUESTS` (see [where a request does not hit disk](SEQUENTIAL_QUEUE.md#where-the-request-actually-hits-disk-and-where-it-doesnt)). A hook that watched the queue for a READ or side-effect command would therefore find nothing while that request runs, so it would return `false` for the entire lifetime of the request. The skeleton would never show, which is the opposite of a stuck skeleton but just as wrong.

The registry encodes this in the type system rather than relying on a comment: each command list is typed `WriteCommand[]`, so a READ command in a group is a compile error. Keep it that way.

## The READ-command exception: Search

Search is the case the queue pattern cannot serve. A search is a **READ** command, so its request never enters the queue and no queue-backed hook can observe it. Search needs a different, self-contained way to answer "is this pending, and how did it end."

Search stamps an explicit **terminal lifecycle state** on the snapshot it is loading. `CONST.SEARCH.SNAPSHOT_STATE` defines three mutually exclusive values, `loading`, `loaded`, and `error`, carried on the `state` field of the snapshot's `search` info (see `SearchResultsInfo` in `src/types/onyx/SearchResults.ts`). The search action lifecycle owns the transitions, in `getOnyxLoadingData` in `src/libs/actions/Search.ts`:

- **`optimisticData`** stamps `state: loading` when the request starts.
- **`successData`** stamps `state: loaded` on any `200` resolve.
- **`failureData`** stamps `state: error` on failure.
- **`finallyData`** deliberately does **not** write `state`, because it runs after both success and failure and would otherwise clobber the `error` terminal that `failureData` set. Ownership of the terminal state stays with the success and failure branches.

The read side then keys on `state` rather than on a boolean or a data-shape check. This is what makes the empty-result case correct: a search that resolves with no rows is `loaded`, distinct from a search that is still `loading`, so an empty result stops the skeleton instead of hanging it.

This state machine narrows the drift window but does not fully close it, and that limit is worth stating plainly. If the app is killed or reloaded mid-request, no cleanup runs, so `state: loading` can still be stranded on disk, the same failure mode as a stored flag. Because there is no queue entry to consult, the read side must defend itself: **treat a `loading` state with no matching in-flight request as stale** rather than trusting it forever.

## Choosing between the two approaches

| Command type | How pending is derived | Mechanism |
|---|---|---|
| WRITE (`API.write`) | Presence in the queue | A dedicated hook from `useInFlightRequests.ts` |
| READ (`API.read`) or side-effect | An explicit terminal state on the data | A `state` field the action stamps (the Search model) |

Decide by the command type, not by the screen. If the request that gates the UI goes through `API.write`, use a queue-backed hook. If it goes through `API.read` or `API.makeRequestWithSideEffects`, it cannot use the queue, so give its data an explicit terminal state the way Search does. Never derive loading from a hand-maintained boolean or from `data === undefined`; both are the drift-prone shadows this pattern exists to remove.

## Migration discipline

Moving a screen off a stored flag onto a derived gate is a behavior-preserving change on the healthy path and a bug fix only on the failure paths. Keep it that way with the following discipline.

**Keep healthy-path behavior identical.** Before changing a screen, write a per-state truth table and confirm the new gate produces the same output as the old flag in every non-failure state. The change should be visible only when the old flag would have drifted.

| State | Old flag (`IS_LOADING_APP`) | New gate (`useIsAppLoadPending() && !isOffline`) |
|---|---|---|
| Online, `OpenApp` in flight | loading | loading |
| Online, `OpenApp` resolved | not loading | not loading |
| Offline, request parked | (drifts: could be stuck `true`) | not loading (suppressed by `!isOffline`) |
| Reload mid-request | (drifts: stuck `true` on disk) | not loading (no queue entry) |

**Keep the old flag until a dedicated deletion step.** Introduce the derived gate first and let it drive the UI, but leave the stored flag and its writes in place until a separate, self-contained change removes the flag and every writer once nothing reads it. Deleting the flag in the same change that adds the gate mixes a behavior change with a wide cleanup and makes any regression hard to bisect.

**No manual memoization.** React Compiler is active in this repo (see [REACT_COMPILER.md](REACT_COMPILER.md)) and memoizes the selector construction and hook results for you. Do not add `useMemo`, `useCallback`, or a hand-rolled selector cache around these hooks. The one relevant note already lives in `useInFlightRequests.ts`: the compiler keeps the selector references stable across renders keyed on the group and scope key, which is why `useOnyx` does not re-subscribe.

**Add telemetry for the terminal-but-empty case.** A terminal state that still renders a loading UI is a silent failure: the request is done, but the user keeps seeing a skeleton. Instrument the loading UI so this surfaces in Sentry instead of being invisible. `useSkeletonSpan` (in `src/libs/telemetry/useSkeletonSpan.ts`, and wrapped by the `reasonAttributes` prop on `ActivityIndicator`) opens a span while a skeleton is mounted and flags skeletons that outlive `CONST.TELEMETRY.CONFIG.SKELETON_MIN_DURATION`. Pass a `SkeletonSpanReasonAttributes` object with a `context` describing the screen and any state that explains the render (e.g. `isOffline`), so a skeleton that should have resolved but did not is queryable under the `skeleton.` namespace. This is the backstop that catches the exact failure this pattern is meant to prevent, in case a new drift path appears.
