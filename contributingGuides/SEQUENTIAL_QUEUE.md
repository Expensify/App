# SequentialQueue

## Overview

The SequentialQueue is how the app keeps its **offline-first promise**: a user can "do their thing" regardless of connectivity, and every change they make is delivered to the server **once, in order, at the right time** — even across going offline, refreshing the tab, or restarting the app.

Concretely, `SequentialQueue` is a **single-flight, FIFO, leader-only engine** that drains every `API.write()` request one at a time, with exponential backoff on failure, surviving offline periods and (for most requests) app restarts. It is a coordinator over four collaborators:

| Collaborator | Role |
|---|---|
| **PersistedRequests** | The request store — an in-memory mirror of the on-disk queue (`persistedRequests` array + a single `ongoingRequest`). |
| **RequestThrottle** | Per-instance exponential backoff with jitter; produces the "give up" signal. |
| **QueuedOnyxUpdates** | A separate in-memory buffer holding WRITE responses' Onyx updates until the whole queue drains (anti-flicker). |
| **The middleware chain** (`Request.processWithMiddleware`) | Where a single request actually runs end-to-end (XHR + auth + response persistence). |

> **The one inversion to internalize before reading further:** within this subsystem, **in-memory state is authoritative and disk is a lagging backup** — the opposite of the usual Onyx contract. `PersistedRequests` deliberately ignores most of its own Onyx subscription echoes. Roughly half of that module is defensive code protecting this invariant. A reader who misses this will misread much of it as redundant. See [Why in-memory is authoritative](#why-in-memory-is-authoritative).

This document covers **how the queue works today**. For sibling concerns:
- **How the app decides it is offline** (the hard-stop model, failure tracking, reachability) → [Network State Detection](NETWORK_STATE_DETECTION.md).
- **How features should behave when offline** (optimistic UX patterns A/B/C/D) → [Offline UX Patterns](philosophies/OFFLINE.md).

This is an observational reference. Where current behavior diverges from apparent intent, that is noted neutrally in a **Sharp edges** subsection on the relevant block. All references use module and function **names**, not line numbers, so the doc survives refactors — read it in terms of blocks and their relationships.

## Contents

- [Overview](#overview)
- [Architecture Diagram](#architecture-diagram)
- [Lifecycle of One Request](#lifecycle-of-one-request)
- [Restart Recovery](#restart-recovery)
- Building Blocks: [SequentialQueue](#sequentialqueue-the-coordinator) · [PersistedRequests](#persistedrequests-the-store) · [Where the request hits disk](#where-the-request-actually-hits-disk-and-where-it-doesnt) · [RequestThrottle](#requestthrottle-backoff) · [QueuedOnyxUpdates](#queuedonyxupdates-and-queueflusheddata) · [Public Contract](#public-contract-the-api-layer) · [Inbound Consumers](#inbound-consumers-who-calls-the-queue)
- [The State Machine](#the-state-machine)
- [Error Handling](#error-handling)
- Runtime Dimensions: [Multi-Tab & Leader Election](#multi-tab--leader-election) · [Offline Behavior](#offline-behavior) · [Pausing & Data-Gap Sync](#pausing--data-gap-sync)
- [The Middleware Chain](#the-middleware-chain-boundary)
- [Conflict Resolution](#conflict-resolution)
- [Test Coverage](#test-coverage)
- [Configuration Constants](#configuration-constants)
- [Key Modules Reference](#key-modules-reference)
- [Relationship to Other Docs](#relationship-to-other-docs)

## Architecture Diagram

```
 feature code
     │  API.write(command, params, onyxData, conflictResolver)
     ▼
┌────────────────────────────────────────────────────────────┐
│ API.index — prepareRequest                                   │
│  • apply optimisticData to Onyx (UI updates NOW)             │
│  • evaluate conflictResolver #1 (read-only: skip optimistic?)│
│  • stamp requestIndex++  (per-tab counter; requestID legacy) │
│  • strip optimisticData from the persisted request           │
└───────────────┬──────────────────────────────────────────────┘
        write    │ read → waitForWrites() → SequentialQueue.waitForIdle()
                 ▼                              (blocks on isReadyPromise)
┌────────────────────────────────────────────────────────────┐
│ SequentialQueue.push()  (async)                              │
│  • conflictResolver #2 (authoritative: mutate the queue)     │
│  • PersistedRequests.save  → in-memory SYNC; disk AWAITED    │
│  • mark isReadyPromise pending (sync, before first await)    │
│  • await persistencePromise (disk commit) THEN dispatch:     │
│      offline   → await persist, return (reconnect flushes)   │
│      running   → defer: isReadyPromise.then(flush(false))    │
│      idle      → flush(false)                                │
└───────────────┬──────────────────────────────────────────────┘
                 ▼
┌────────────────────────────────────────────────────────────┐
│ flush(shouldResetPromise)                                    │
│  guards (in order): paused? · offline? · already running? ·  │
│                     all empty? (queue · ongoing · buffered   │
│                     onyx updates) · NOT the leader?          │
│  → isSequentialQueueRunning = true                           │
│  → (maybe) reset isReadyPromise                              │
│  → load PERSISTED_REQUESTS, then process()                   │
└───────────────┬──────────────────────────────────────────────┘
                 ▼
┌────────────────────────────────────────────────────────────┐
│ process()  (recurses until queue empty)                      │
│  • processNextRequest(): head → ongoingRequest               │
│       (atomic multiSet of both keys; returns LOCAL ref)      │
│  • processWithMiddleware(request, isFromSequentialQueue=true) │
│        makeXHR → Logging → … → SaveResponseInOnyx →           │
│                                FraudMonitoring                │
│  • .then  → (pause if shouldPauseQueue) → remove request →    │
│             save queueFlushedData → throttle.clear → RECURSE  │
│  • .catch → error ladder (drop / treat-as-success /          │
│             retry+backoff / give-up)                         │
└───────────────┬──────────────────────────────────────────────┘
                 ▼
┌────────────────────────────────────────────────────────────┐
│ process().finally   (the drain-end block, inside flush)     │
│  • isSequentialQueueRunning = false                          │
│  • resolve isReadyPromise IFF offline OR queue empty         │
│  • if queue empty: flush QueuedOnyxUpdates,                  │
│                    then apply + clear queueFlushedData       │
└────────────────────────────────────────────────────────────┘

  boundary collaborators (contract only — linked, not owned here):
   • ActiveClientManager  → isClientTheLeader()  (web multi-tab)
   • NetworkState         → getIsOffline()        (see NETWORK_STATE_DETECTION.md)
   • OnyxUpdateManager    → resolves shouldPauseQueue data gaps, then unpause()

  disk writes — PERSISTED_* keys; cache + subscribers update SYNC first,
  the returned Onyx promise resolves on STORAGE COMMIT (IDB tx / SQLite WAL):
   • #1  save()             → PERSISTED_REQUESTS            (in push; AWAITED before flush)
   • #2  processNextRequest → PERSISTED_REQUESTS + ONGOING  (promotion; fire-and-forget)
   •     end / rollback / updateOngoing                     (fire-and-forget)
   •     conflict update / delete                           (awaited by handleConflictActions)
   ✓  push awaits the #1 disk commit before flush → makeXHR; makeXHR itself still gates
      only on auth readiness, so the network can no longer fire ahead of the enqueue write
```

## Lifecycle of One Request

This is the connective narrative — how the blocks interact at runtime for a single `API.write()`.

1. **Prepare (synchronous, in `API.index.prepareRequest`).** `optimisticData` is applied to Onyx immediately, so the UI reflects the change at once. The conflict resolver is evaluated **read-only** here, solely to decide whether to *suppress* the optimistic data (`conflictAction.type === 'noAction'`); the rest of the conflict action is ignored at this site. A `requestID` is stamped from a per-tab counter (the field is literally `requestIndex`; `requestID` is read only as a legacy fallback in `getClientRequestIndex` — this doc keeps the conventional name), and `optimisticData` is stripped from the version that will be persisted (it has already been applied).

2. **Push (`async SequentialQueue.push`).** The conflict resolver runs a **second** time, now **authoritatively**, against the live persisted requests — this is the evaluation that may mutate the queue (push / replace / delete). The resolver function is then deleted off the request (it cannot be serialized), and `PersistedRequests.save` mutates the in-memory array **synchronously** while issuing the disk write (captured as `persistencePromise`). `push` then marks `isReadyPromise` pending synchronously (before its first `await`, so a READ on the next tick parks behind this write) and **`await`s `persistencePromise` — the disk commit — before flushing**. After the commit it dispatches on three conditions: **offline** → `await` persist and return (reconnect will flush later); **already running** → defer via `isReadyPromise.then(() => flush(false))`; **idle** → `flush(false)`. A network flip to offline *during* the awaited write is handled explicitly: `push` resolves `isReadyPromise` and returns without flushing.

3. **Flush (`flush`).** Five guards run in order — paused, offline, already-running, all-empty (three-legged: queue, `ongoingRequest`, **and** the `QueuedOnyxUpdates` buffer — see [the coordinator](#sequentialqueue-the-coordinator)), **not-leader**. If all pass, `isSequentialQueueRunning` is set, `isReadyPromise` is optionally reset, and a throwaway `PERSISTED_REQUESTS` connection guarantees disk is loaded before `process()` runs (it opts out of connection reuse, because `PersistedRequests` already holds a live `PERSISTED_REQUESTS` connection and reusing it would fire extra callbacks).

4. **Process (`process`).** Guards again (paused / offline / empty), then `processNextRequest` promotes the head to `ongoingRequest` and runs the middleware chain. On success it removes the request and **recurses**; on error it walks the [error ladder](#error-handling).

5. **Finally (the drain-end `process().finally`, chained inside `flush`).** The running flag clears, `isReadyPromise` resolves **iff offline or the queue is empty**, and — only when the queue is fully drained — `QueuedOnyxUpdates` is flushed and `queueFlushedData` is applied and cleared.

## Restart Recovery

The persisted queue exists so an interrupted WRITE survives an app kill. The pieces are described across the blocks below; here is the one cold-start path that strings them together.

1. **Disk load.** On startup, the `PERSISTED_REQUESTS` and `PERSISTED_ONGOING_REQUESTS` connect callbacks hydrate the in-memory mirror — `persistedRequests` from the array, `ongoingRequest` from the single key.
2. **Head dedupe.** If the app was killed _after_ a request was promoted to `ongoingRequest` but _before_ it was removed, the same request can sit both as `ongoingRequest` and as the head of the array. The init path strips the array head when it `deepEqual`s the rehydrated `ongoingRequest` — this is the reason that structural dedupe exists.
3. **Flush.** `onPersistedRequestsInitialization` fires `flush()` once there is recovered work (and, separately, `Network/index` fires a startup flush gated on `ActiveClientManager.isReady()`, so the leader gate is meaningful on the first drain). The registered callback is not startup-only: the `PERSISTED_ONGOING_REQUESTS` connect callback re-fires it post-init whenever a *new* ongoing request appears (e.g. observed from another tab) — see [Inbound Consumers](#inbound-consumers-who-calls-the-queue).
4. **Re-drive.** `processNextRequest` sees a non-null `ongoingRequest` and returns it directly (rather than promoting a new head), so the **same** interrupted request is re-sent.

**What does _not_ recover:**

- A **File/Blob ongoing request** — `PERSISTED_ONGOING_REQUESTS` holds `null` on disk (the live object was memory-only), so there is nothing to re-drive; the upload is lost.
- A request lost in one of the remaining **fire-and-forget persist windows** — the promotion (`processNextRequest`), removal (`endRequestAndRemoveFromQueue`), and rollback writes are not awaited, so a crash between an in-flight request acting on the server and its `multiSet` committing can leave the disk record momentarily stale. The *enqueue* window is no longer one of these: `push` now awaits the `save()` disk commit before flushing, so a freshly-pushed request cannot reach the server while still absent from disk. See [Where the request actually hits disk](#where-the-request-actually-hits-disk-and-where-it-doesnt).

**On sign-out (a different reset):** `Session.cleanupSession()` aborts the in-flight cancellable XHR via `HttpUtils.cancelPendingRequests()` — surfacing as `REQUEST_CANCELLED` to `process()`'s catch (dropped, no data applied) — and clears the persisted queue via `PersistedRequests.clear()`. This is the only inbound path that _aborts_ an in-flight request rather than letting it complete. A bare `Onyx.clear()` (without the abort) resets the mirror to `[]`/`null` through the carve-out path, but because `isInitialized` is already true the init callback does **not** re-fire, so clearing on its own schedules no flush; an in-flight `process()` chain holds local references and is unaffected by the memory wipe.

---

# Building Blocks

Each block is described as **the problem it solves → how it works today → sharp edges** (neutral observations where current behavior is surprising or diverges from apparent intent). For crux/connective blocks (e.g. the disk-persistence and runtime-dimension sections), the sharp edges are woven into the prose rather than a labeled subsection.

## SequentialQueue (the coordinator)

**Problem it solves.** Serialize every WRITE so requests reach the server one at a time, in submission order, exactly once — with automatic retry on transient failure and correct ordering of dependent READs.

**How it works today.**
- **Single-flight.** `isSequentialQueueRunning` is the re-entry guard: set at the top of `flush()` after the guards pass, cleared in `process().finally`. While set, new pushes defer rather than start a parallel drain.
- **`push()` dispatch.** `push` is `async`. It marks `isReadyPromise` pending synchronously, then **`await`s the disk-persistence promise before dispatching**: offline → `await` persist, return; running → defer behind `isReadyPromise.then(() => flush(false))`; idle → `flush(false)`. The queue no longer fires off the synchronous in-memory state ahead of the commit.
- **`flush()` guards, in order.** `isQueuePaused` → `isOfflineNetwork()` → `isSequentialQueueRunning` → all-empty → `!isClientTheLeader()`. The all-empty guard is three-legged — no queued requests, no `ongoingRequest`, **and** an empty `QueuedOnyxUpdates` buffer — so `flush()` doubles as the drain path for buffered updates on a request-empty queue. Leadership is checked **exactly once**, before the running flag flips; the recursive `process()` chain re-checks only `isQueuePaused` and `isOfflineNetwork()`, never leadership.
- **`process()` recursion.** Pull the next request, run middleware, on success recurse; the recursion terminates when the queue and ongoing request are both empty.
- **READ-after-WRITE gate.** `waitForIdle()` returns `isReadyPromise`; READs block on it so a READ response cannot clobber optimistic data from in-flight WRITEs on the same keys. See [the state machine](#the-state-machine) for the resolution rule.

**Sharp edges.**
- `push()` `await`s `persistencePromise` (the enqueue disk commit) before it ever calls `flush()`, so a freshly-pushed request cannot reach the server while still absent from disk — the enqueue crash window is closed — post-initialization only (see [Where the request actually hits disk](#where-the-request-actually-hits-disk-and-where-it-doesnt)). `makeXHR` still gates only on auth readiness (never on a disk write); the ordering guarantee now comes from `push` awaiting the commit, not from `makeXHR`. The *promotion/removal/rollback* writes inside `process()` remain fire-and-forget (see [Where the request actually hits disk](#where-the-request-actually-hits-disk-and-where-it-doesnt)).
- Leadership being checked once per flush means a leadership change *during* an in-flight drain is not re-evaluated by the running cycle (see [Multi-Tab & Leader Election](#multi-tab--leader-election)).

## PersistedRequests (the store)

**Problem it solves.** Hold the queue durably enough to survive offline periods and app restarts, while remaining correct under (a) Onyx's synchronous, sometimes out-of-order subscription callbacks and (b) multiple browser tabs sharing one queue.

**How it works today.**
- **Two Onyx keys, one mirror.** `PERSISTED_REQUESTS` (the array) and `PERSISTED_ONGOING_REQUESTS` (the single in-flight request) back an in-memory mirror (`persistedRequests`, `ongoingRequest`). After initialization the in-memory copies are authoritative.
- **The ongoing-request model.** `processNextRequest` captures the head as a **local** reference, sets `ongoingRequest`, trims the queue (`slice(1)`), and writes **both keys in a single atomic `Onyx.multiSet`** — so a crash cannot leave the request both "in the queue" and "ongoing." `rollbackOngoingRequest` and `endRequestAndRemoveFromQueue` likewise update both keys together.
- **Why `processNextRequest` returns the local reference.** Onyx's post-`multiSet` callback fires synchronously and would overwrite the module-level `ongoingRequest` with a JSON-serialized copy — which strips `File`/`Blob` payloads. Returning the captured local reference preserves the live objects for the request about to run. (The `knownOngoingRequestIDs` own-write guard ignores that echo for requests carrying a `requestIndex` — the local-ref return is load-bearing for those without one.)
- **File/Blob _ongoing_ requests are not durably persisted.** `shouldPersistOngoingRequest` returns false when any value in `request.data` is a `File`/`Blob`, so `null` is written to `PERSISTED_ONGOING_REQUESTS` and the live object is kept only in the in-memory `ongoingRequest` mirror (a `File`/`Blob` cannot be structured-cloned to survive a restart anyway). Note this null-out guard applies **only to the ongoing key** — the `PERSISTED_REQUESTS` array writes the full request, File/Blob included; IndexedDB can store it on web, while SQLite reduces it to `{}` on native. See [Where the request actually hits disk](#where-the-request-actually-hits-disk-and-where-it-doesnt).
- **Structural removal.** `endRequestAndRemoveFromQueue` and the init-time dedupe match by `deepEqual` (structural), **not** by `requestID`. `requestID` matching is used only for cross-tab merge and leader-deletion reconciliation (via `knownRequestIDs`).
- **`getLength()` counts the ongoing request.** It returns the array length plus one when `ongoingRequest` is non-null, so `getLength() === 0` means the queue is truly idle.

### Why in-memory is authoritative

Onyx (since 3.0.46) fires `set`/`multiSet` subscription callbacks **synchronously and sometimes out of order**. A naive subscriber that adopted every echoed value could let a stale, older echo overwrite correct in-memory state — losing or duplicating queued requests (the failure mode behind that era's lost/duplicated-request bug). So `PersistedRequests` ignores its own write echoes:

- The `PERSISTED_REQUESTS` callback, once initialized, does **not** blindly adopt disk. It absorbs only requests whose `requestID` is **not** in `knownRequestIDs` (genuine cross-tab writes — which it re-persists and reports via the cross-tab callback), and it reconciles leader-tab deletions only while `pendingOnyxWrites === 0`.
- `pendingOnyxWrites` is a hand-maintained counter: `trackOnyxWrite` wraps the `Onyx.set`/`multiSet` calls the module issues (across both keys) so the callback can tell "this echo is my own in-flight write" from "this is a real external change." One write escapes the wrapper: `clear()` issues its `Onyx.set(PERSISTED_ONGOING_REQUESTS, null)` bare (only the companion array write is tracked).
- **Two carve-outs** still adopt disk: a `null` value (e.g. from `Onyx.clear()`) falls through to the disk-load/re-init path (the guard is gated on `val != null`); and genuinely-new cross-tab requests identified by an unknown `requestID`.

**Sharp edges.**
- The `PERSISTED_ONGOING_REQUESTS` callback **is guarded against own-write echoes, but differently** from the array: it early-returns when the value's `requestIndex` is in `knownOngoingRequestIDs` (a set fed by `processNextRequest` and `updateOngoingRequest`). It never consults `pendingOnyxWrites`; `knownOngoingRequestIDs` is its only own-write guard (the set also catches stale serialized copies a write-counter cannot). Two paths are adopted unconditionally — a `null` echo and a value with an unknown (or missing) `requestIndex`. The same callback also fires `triggerInitializationCallback()` (= `flush`) post-init when a new ongoing request appears — a mid-session flush trigger (see [Inbound Consumers](#inbound-consumers-who-calls-the-queue)).
- The `pendingOnyxWrites` counter is a hand-rolled ordering mechanism reimplementing a guarantee the data layer doesn't provide. It is correct only as long as every own write is wrapped and increments/decrements stay balanced (`clear()`'s bare ongoing-key write is the one exception — see above).
- Structural `deepEqual` removal is keyed on object shape, not identity. If a request object is mutated mid-flight by middleware (e.g. optimistic-ID rewriting, a `shouldRetry` flag, `File` stripping on serialization, an added rollback marker), a later `deepEqual` can fail to match the original.
- `persistWhenOngoing` is a **vestigial field**. It is read only for logging (in `processNextRequest`, `SequentialQueue`, and `RequestsQueuesState`) and is never assigned by any production write path — ongoing-request persistence is unconditional, gated only by `shouldPersistOngoingRequest` (serializability). Every production read resolves to `undefined`; it is safe to remove.

## Where the request actually hits disk (and where it doesn't)

This is the crux for any crash-safety or persist-before-fire reasoning, so it is worth pinning exactly.

**A WRITE persists through one function.** `PersistedRequests.save()` — invoked by `SequentialQueue.push()` directly, or via `handleConflictActions` for the conflict paths. Every mutator in `PersistedRequests` shares one shape: the in-memory module state (`persistedRequests`, `ongoingRequest`, `knownRequestIDs`) is updated **synchronously first**, then the Onyx write is issued with the already-updated value, wrapped in `trackOnyxWrite`.

**The Onyx promise is a real disk-commit handle, not a cache handle.** In `OnyxUtils` (`setWithRetry`/`multiSetWithRetry`), the cache is updated and subscribers are notified **synchronously** via `broadcastUpdate`/`keyChanged` — there is a source comment, _"This approach prioritizes fast UI changes without waiting for data to be stored in device storage"_ — and the function then returns the `storage.setItem`/`storage.multiSet` chain. That returned promise resolves only after the storage provider commits: an IndexedDB transaction `complete` event on web, or a SQLite WAL commit on native (`journal_mode=WAL`, `synchronous=NORMAL` — durable across a JS/app crash, weaker than an fsync against OS-level power loss). So `push()`'s `persistencePromise` **does** represent durable persistence. Three caveats bound that statement: a **`null` write** returns `Promise.resolve()` immediately (the storage delete runs fire-and-forget — see below), so for null/delete payloads the promise is *not* a commit handle, and a `multiSet` containing a `null` value covers only its non-null pairs (e.g. `endRequestAndRemoveFromQueue`'s "atomic" promise covers only the array write, not the ongoing-key delete); Onyx's internal `retryOperation` **swallows storage failures** after `MAX_STORAGE_OPERATION_RETRY_ATTEMPTS` (5), resolving anyway; and on web Onyx can silently **degrade to `MemoryOnlyProvider`** when the IndexedDB store cannot be created, after which every "commit" is memory-only.

**And on the enqueue path, the disk write now gates the network.** `push` is `async`: it issues `save()` (synchronous in-memory update + the disk write captured as `persistencePromise`), marks `isReadyPromise` pending, then **`await`s `persistencePromise`** and only afterward calls `flush(false)`. So the enqueue commit lands before `flush()` → `process()` → `processWithMiddleware()` → `makeXHR()` ever runs. `makeXHR` itself still gates the `HttpUtils.xhr` call only on `hasReadRequiredDataFromStorage()` (auth/NetworkStore readiness) — it has no disk gate — but the request can no longer leave the device ahead of its enqueue commit, because `push` blocked on that commit first. (The in-flight `#2` promotion `multiSet` is still fire-and-forget; the gate closed is specifically the enqueue window.) **This holds only once `PersistedRequests` has initialized.** Before initialization, `save()` parks the request in `pendingSaveOperations` and returns `Promise.resolve()` — *not* a commit handle — so `push`'s `await` is a no-op. The real enqueue write is issued later by the init connect-callback as an **un-awaited** `Onyx.set(PERSISTED_REQUESTS, …)`, which then calls `triggerInitializationCallback()` → `flush()`. So during that startup window the XHR can still fire ahead of the enqueue commit; the crash window is closed only after initialization.

```
async push()  (online · idle · no conflict)
  │
  ├─ save(req)
  │     ├─ persistedRequests.push(req)        ── in-memory mirror: SYNC, authoritative now
  │     └─ persistencePromise = Onyx.set(PERSISTED_REQUESTS, arr)
  │              ├─ cache + subscriber broadcast        ── SYNC (same tick)
  │              └─ storage.setItem(...)  ── async → resolves on DISK COMMIT  ▒▒ #1
  │
  ├─ setIsReadyPromisePending()  ── SYNC, before first await (READs park behind us)
  │
  ├─ await persistencePromise    ── ⏸ BLOCKS until #1 disk commit lands
  │     (if network flipped offline meanwhile → resolveIsReadyPromise() + return, no flush)
  │
  └─ flush(false)               ── runs only AFTER #1 committed
        └─ process()
              ├─ processNextRequest → Onyx.multiSet(PERSISTED_REQUESTS, ONGOING)  ▒▒ #2 (not awaited)
              └─ processWithMiddleware → makeXHR
                    └─ gate: hasReadRequiredDataFromStorage()  (auth only — no disk gate)
                          └─ HttpUtils.xhr(...) ───────────────────────►  NETWORK FIRES

   ╔══════════════════════════════════════════════════════════════════╗
   ║  ORDERING:  #1 disk commit ──►  NETWORK FIRES                     ║
   ║  the enqueue commit is awaited before the request can reach the    ║
   ║  server, so a crash before flush cannot lose a not-yet-persisted   ║
   ║  request. (Remaining fire-and-forget windows: #2 promotion,        ║
   ║  removal, rollback.)                                               ║
   ╚══════════════════════════════════════════════════════════════════╝
```

**Persist points** (all update the in-memory mirror synchronously first; the Onyx promise resolves on disk commit):

| When | Function | Key(s) written | Awaited by the control flow? |
|---|---|---|---|
| Enqueue | `save()` | `PERSISTED_REQUESTS` | **Yes** — `push` awaits `persistencePromise` before `flush()` |
| Promote head → ongoing | `processNextRequest()` | both (atomic `multiSet`) | No — fire-and-forget |
| Success / non-retryable drop | `endRequestAndRemoveFromQueue()` | both (atomic `multiSet`) | No — fire-and-forget |
| Retryable failure | `rollbackOngoingRequest()` | both (atomic `multiSet`) | No — fire-and-forget |
| Conflict REPLACE | `update()` | `PERSISTED_REQUESTS` | **Yes** — `handleConflictActions` awaits it |
| Conflict DELETE | `deleteRequestsByIndices()` | `PERSISTED_REQUESTS` | **Yes** — `handleConflictActions` awaits it |
| In-flight update (e.g. reauth) | `updateOngoingRequest()` | `PERSISTED_ONGOING_REQUESTS` | No |

> `save()`'s disk-write `.catch` (and those on `update()` / `deleteRequestsByIndices()`) `Log.alert`s a storage emergency but does **not** re-throw, so `persistencePromise` resolves to `void` whether the storage commit **succeeded or failed** — even a consumer that awaits it (e.g. `push` itself, or `API.write`) cannot detect a failed persist. `push` leans on this deliberately: its `await persistencePromise` is wrapped in a `try/catch` that flushes anyway on rejection, since the request is already in the in-memory queue. Onyx itself can also swallow a failed commit — the retry caveat above — so the silence has two layers.

**Where a request does _not_ hit disk:**

- **READ commands and `makeRequestWithSideEffects`** never route through `save()` — nothing is persisted or recovered for them.
- **`save()` before initialization** parks the request in `pendingSaveOperations` and returns `Promise.resolve()`; the real write is deferred to the init connect callback.
- **A File/Blob _ongoing_ request** writes `null` to `PERSISTED_ONGOING_REQUESTS` (kept in memory only) and is unrecoverable on restart — but see the asymmetry below: the queue _array_ does write it.
- **`Onyx.set(key, null)`** (e.g. clearing the ongoing key) is routed to a storage **delete** (`remove()`), not a value write — and its returned promise is `Promise.resolve()`, resolved before the delete commits.
- **Subscriber broadcasts** are the synchronous cache/callback loop; they run before — and independently of — the storage write.
- **Asymmetry:** the File/Blob null-out guard applies **only to the ongoing key**. `PERSISTED_REQUESTS` array writes carry no such guard and pass the File/Blob through to the storage provider intact — IndexedDB structured-clone stores a `File` on web, while SQLite's `JSON.stringify` reduces it to `{}` (data lost) on native. File/Blob is therefore **not** uniformly kept off disk.

## RequestThrottle (backoff)

**Problem it solves.** Keep retrying a transiently-failing request without hammering a degraded backend — spread load with jittered exponential backoff — and provide a definite "give up" signal when retries are exhausted.

**How it works today.**
- **`getRequestWaitTime`** seeds the first wait with a random jitter in `[MIN_RETRY_WAIT_TIME_MS, MAX_RANDOM_RETRY_WAIT_TIME_MS]` = `[10, 100]` ms, then **doubles** the prior wait on each retry, capped at `MAX_RETRY_WAIT_TIME_MS` (10 s).
- **`sleep`** increments the retry count and picks the cap — `MAX_OPEN_APP_REQUEST_RETRIES` (2) for the `OPEN_APP` command, else `MAX_REQUEST_RETRIES` (10). Within the cap it resolves after the wait; once exceeded it **rejects with no argument** — this argument-less rejection is the give-up signal that `process()`'s catch consumes.
- **`clear`** resets the wait, the retry count, and any pending timeout — called on success and on any non-retryable outcome.
- The queue uses a single shared instance, `sequentialQueueRequestThrottle`.

**Sharp edges.**
- After the retry cap, a request is **permanently dropped** (see the [give-up row](#error-handling)) — for non-`OPEN_APP` commands with no user-facing modal.
- `clear()` fires on every success, so a burst that interleaves successes with failures keeps resetting backoff to the floor, weakening the intended exponential spacing against a degraded backend.

## QueuedOnyxUpdates and queueFlushedData

These are **two distinct deferral mechanisms** that are easy to confuse.

**Problem `QueuedOnyxUpdates` solves.** Prevent UI flicker: if each WRITE's response Onyx updates were applied immediately as the queue drained, the UI would replay intermediate states. Instead, WRITE responses are buffered and applied **after the whole queue drains**.

**How `QueuedOnyxUpdates` works.** It is a module-level **in-memory** buffer. `queueOnyxUpdates` appends and resolves immediately; `flushQueue` snapshots-and-clears (to avoid races) then applies via `Onyx.update`. The WRITE-vs-READ routing decision lives **upstream** in `OnyxUpdates.applyHTTPSOnyxUpdates`: WRITE-type responses (`onyxData`, then `successData`/`failureData`/`finallyData`) route through `queueOnyxUpdates`; READ-type responses apply via `Onyx.update` immediately. When not signed in, `flushQueue` filters the snapshot to a 15-key preserved allowlist (`SESSION`, `NETWORK`, `IS_LOADING_APP`, `HAS_LOADED_APP`, `CREDENTIALS`, `ACCOUNT`, `MODAL`, `PRESERVED_USER_SESSION`, the theme/locale/try-new-dot/focus-mode NVPs, and the three RAM-only loading flags); the filter is skipped entirely under `CONFIG.IS_TEST_ENV`. The pause early-return lives in `SequentialQueue.flushOnyxUpdatesQueue` (returns early when `isQueuePaused`). It is invoked at the end of a full drain — and from two other entry points: `flush()`'s all-empty guard counts a non-empty buffer as pending work (a flush with zero requests proceeds purely to drain the buffer), and `unpause()` calls it directly when the queue is already empty.

**Problem `queueFlushedData` solves.** Apply a small piece of data **only after a full drain** — specifically, mark the app as loaded only once the queue has actually emptied (not mid-drain).

**How `queueFlushedData` works.** It is a **distinct, Onyx-persisted** buffer (`QUEUE_FLUSHED_DATA`), separate from the in-memory `QueuedOnyxUpdates`. `SequentialQueue.saveQueueFlushedData` appends a successfully-processed request's `queueFlushedData` field; the queue applies it via `Onyx.update` and clears it only when fully drained (after `flushOnyxUpdatesQueue`). Its sole producer is `App.getOnyxDataForOpenOrReconnect` (`OPEN_APP` / `ReconnectApp`), currently carrying exactly one entry: a merge of `HAS_LOADED_APP = true`.

**Sharp edges.**
- Both apply **only** when the queue reaches fully-empty. Under sustained WRITE pressure neither applies, so `HAS_LOADED_APP` never flips and the buffers accumulate.
- The application chain in the drain-end `process().finally` has no `.catch` — a failed `Onyx.update` silently skips the subsequent clear.

## Public Contract (the API layer)

**Problem it solves.** Give feature code one offline-first surface so it never has to think about connectivity, ordering, or retries.

**How it works today.**

| Method | Persisted? | Retried? | Ordering | Notes |
|---|---|---|---|---|
| `API.write` | Yes (via `push`) | Yes (throttle) | FIFO, leader-only | Applies `optimisticData` synchronously, strips it from the persisted request, then `push`es. Resolves to `void` — does **not** await the network round-trip. Maps to [OFFLINE.md](philosophies/OFFLINE.md) patterns A/B. |
| `API.read` | No | No | Blocks on `waitForIdle()` (`isReadyPromise`) before sending | Applies `optimisticData` but never persists. Fire-and-forget through the middleware. Two short-lived-auth sign-in commands bypass `waitForWrites`; `API.paginate`'s READ flavor sits behind the same gate. |
| `API.makeRequestWithSideEffects` | No | No | None — bypasses the queue entirely | For commands whose caller needs the response. Online-only in effect. |

- **The conflict resolver runs twice.** Read-only in `prepareRequest` (only to set "apply optimistic data?"), then authoritatively in `push` (mutates the queue). See [Conflict Resolution](#conflict-resolution).
- **`API.read` blocks on writes** because a READ that returned before in-flight WRITEs landed could overwrite optimistic data on the same keys.

**Sharp edges.**
- `makeRequestWithSideEffects` is **not** persisted or retried. Offline, the underlying `fetch` fails and the promise the caller received **rejects** (logged and re-thrown by the `Logging` middleware). It is not silently swallowed — but nothing retries it, so the caller must handle the rejection.

## Inbound Consumers (who calls the queue)

The blocks above describe what the queue does; this is the inbound surface — who drives it and the ordering guarantees they lean on.

**Who triggers `flush()`:**

- `push()` on the idle-online path.
- `onPersistedRequestsInitialization` — recovered work at startup (see [Restart Recovery](#restart-recovery)).
- `onCrossTabRequestsMerged` — another tab enqueued a genuinely-new request.
- The `PERSISTED_ONGOING_REQUESTS` connect callback — post-init, when a **new** ongoing request appears (e.g. observed from another tab), it re-fires the registered initialization callback, which is `flush`.
- `Reconnect` — on **two** edges: the offline→online `NetworkState` transition and the app-became-active listener. Both are deliberately decoupled from `reconnect()`'s data-sync (`openApp`/`reconnectApp`), which never flushes.
- `Network/index` startup — `ActiveClientManager.isReady().then(flush)`, the primary "drain whatever survived the last session, once we know who the leader is" trigger.
- The **native background-fetch wake-up** (`backgroundTask`), which flushes on a native scheduler tick.

**Two ordering gates (don't conflate them):**

- **`waitForIdle()`** resolves when the _whole_ queue drains (returns `isReadyPromise`). Beyond `API.read`, it is consumed by auth-token-swap and post-sign-in flows — `Delegate` connect/disconnect, `Session` merge-account, and `SignInModal` before `openApp` — to fully drain pending WRITEs under the **current** authToken before swapping tokens; sending a queued WRITE under a new token trips `Reauthentication` and forces a logout.
- **`getCurrentRequest()`** resolves when only the _single in-flight_ request's `process()` chain settles (or immediately if none is in flight). Its production consumer is `User.ts`'s Pusher multi-event handler, which sequences server-pushed Onyx updates **after** the in-flight WRITE so a push cannot apply ahead of the WRITE response that may carry related updates.

**Direct `PersistedRequests` callers (bypassing `push`/`flush`):**

- `App` clear-and-restore and `ImportOnyxState` — `rollbackOngoingRequest()` to snapshot/restore the queue around an `Onyx.clear()` or a state import. The `App` path also takes a `getAll()` snapshot and restores via direct `save()` calls — a raw enqueue that bypasses `push()` (no conflict resolution, no flush trigger).
- `Report.getGuidedSetupDataForOpenReport` — `getAll()` (read-only) to scan the queue for an already-enqueued `OPEN_REPORT` carrying `guidedSetupData`, preventing duplication.
- `Policy` and `HandleUnusedOptimisticID` — `getAll()` + `update()`/`updateOngoingRequest()` to rewrite a queued (or in-flight) request in place, e.g. optimistic-ID repair.
- `API.index` — `getLength()` (read-only). This does **not** gate reads; `waitForWrites` always awaits `waitForSequentialQueueIdle()` (= `isReadyPromise`) regardless of the count.
- `isPaused()` / `isRunning()` are read-only accessors — `RequestsQueuesState` diagnostics reads these plus `getAll()`/`getOngoingRequest()` directly; `MainQueue` consumes `isRunning()` **behaviorally**, holding its own processing while the sequential queue drains.

---

# The State Machine

`SequentialQueue` is driven by seven module-level variables plus the shared throttle instance. This table is the densest reference for reasoning about invariants during a refactor.

| Variable | Meaning | Set where | Cleared where | Invariant |
|---|---|---|---|---|
| `isSequentialQueueRunning` | Single-flight / re-entry guard | top of `flush()` after guards pass | `process().finally` | At most one drain in progress per tab |
| `currentRequestPromise` | The in-flight `process()` chain (for `getCurrentRequest`) | start of the process chain | the drain-end `process().finally` (set to `null`) | Non-null only while a request is in flight |
| `isQueuePaused` | Data-gap / deferred-update pause **only** (never offline) | `pause()` — the `shouldPauseQueue` response, `DeferredOnyxUpdates`, `applyOnyxUpdatesReliably` | `unpause()` / `resetQueue()` | While true, nothing is processed; offline is a **separate** `isOfflineNetwork()` check in `push`/`flush`/`process` |
| `isReadyPromise` / `resolveIsReadyPromise` | One-shot gate READs block on (READ-after-WRITE ordering) | starts **already-resolved** (`Promise.resolve()`) at module load; armed pending via `setIsReadyPromisePending()` — in `push()`'s sync prelude and in `flush(true)` | `resolveIsReadyPromise()` — see the four sites below | A READ may proceed only when no WRITE it must follow is pending |
| `isReadyPromisePending` | Idempotency guard for `setIsReadyPromisePending()` (prevents orphaning READs parked on a prior pending promise) | `true` when a pending promise is armed | `false` inside `resolveIsReadyPromise` | At most one pending `isReadyPromise` is armed at a time |
| `shouldFailAllRequests` | Sticky `NETWORK`-key flag → erroring requests are failed and dropped | `NETWORK` Onyx callback | `NETWORK` Onyx callback | Test/debug only |
| `queueFlushedDataToStore` | In-memory mirror of `QUEUE_FLUSHED_DATA` | the `QUEUE_FLUSHED_DATA` connect-callback echo of `saveQueueFlushedData`'s `Onyx.set` | `clearQueueFlushedData` | Applied only on full drain |
| `sequentialQueueRequestThrottle` | Shared backoff state (wait time, retry count, pending timeout) | `sleep()` on each generic-error retry | `clear()` on success and every non-retryable outcome | Backoff state never survives a settled request |

### Why `isReadyPromise` resolves on offline, not on paused

In the drain-end `process().finally`, `resolveIsReadyPromise` runs only when `isOfflineNetwork() || !hasRemainingRequests` — keyed on the **direct offline check**, **deliberately not** on `isQueuePaused`. The two are distinct conditions, not one overloaded flag:

- **Offline** (`isOfflineNetwork()`) → resolve. The queue cannot process anyway, so READs should be allowed through (they'll show optimistic/stale data, which is acceptable offline). Going offline never sets `isQueuePaused`; it is checked directly.
- **`isQueuePaused`** (a `shouldPauseQueue` data-gap sync, or a `DeferredOnyxUpdates`/`applyOnyxUpdatesReliably` pause) → do **not** resolve. WRITEs are still pending behind the gap, so READs must keep waiting or they'd clobber in-flight optimistic data. This is exactly why the gate keys on `isOfflineNetwork()` rather than `!isQueuePaused`.

**`resolveIsReadyPromise` is now called from four sites**, not just the `finally`. Because `push()` arms the pending promise *before* awaiting the disk write, every early-out path that would otherwise skip the drain has to release parked READs itself, or they would hang:

1. The **drain-end `process().finally`** — when offline or the queue is empty (above).
2. The **all-empty guard in `flush()`** — e.g. a conflict resolver deleted the only request without pushing a replacement, so there is nothing to drain.
3. The **not-leader guard in `flush()`** — followers never process the queue, so they resolve immediately (otherwise a follower tab's READs would hang forever after any write).
4. **`push()` itself**, when the network flips offline *during* the awaited disk write — `flush()`'s offline early-return wouldn't resolve, so `push` resolves and returns without flushing.

`unpause()` calls `flush(false)` precisely to **preserve** the existing `isReadyPromise` — swapping in a fresh one would orphan READs already awaiting the old promise. (`setIsReadyPromisePending()` is idempotent for the same reason: it no-ops when a pending promise is already armed.)

**Sharp edges.** `isReadyPromise` is a single shared one-shot resolver. If a flush round arms it but never reaches any of the four resolve sites (e.g. a persistent, unresolvable `shouldPauseQueue` data gap), subsequent READs blocked on `waitForIdle()` have no timeout.

---

# Error Handling

When a request errors, `process()`'s `.catch` walks an ordered ladder. **Which Onyx data gets applied diverges sharply by error class** — this table is the contract.

| Error class | Matched by | Retries? | Onyx data applied | User-facing modal | Source / meaning |
|---|---|---|---|---|---|
| `REQUEST_CANCELLED` | `error.name` | No — drop | **None** | No | Sign-out cancels in-flight requests; optimistic state assumed correct |
| `DUPLICATE_RECORD` | `error.message` | No — drop | **None** | No | Record already exists server-side; optimistic state assumed correct |
| `shouldFailAllRequests` | `NETWORK` flag (same branch as above) | No — drop | `failureData` **+** `finallyData` | No | Test/debug fail-all |
| `ALREADY_CREATED` | `error.message` | No — drop | `successData` **+** `finallyData` | No | Resource already created server-side → treat as success |
| `THROTTLED` on `RESEND_VALIDATE_CODE` | `error.message` + command | No — drop | `failureData` | No | Rate-limit (429); do not retry to avoid spam |
| Generic (everything else) | — | **Yes** — `rollbackOngoingPersistedRequest()` then `throttle.sleep().then(process)` | (none until resolved/given-up) | No | Transient network/server errors |
| Give-up (generic, retries exhausted) | `throttle.sleep` rejects with no arg | No — drop | **`failureData` only** (not `finallyData`) | **`OPEN_APP` only** (`setIsOpenAppFailureModalOpen`) | Retry cap (10, or 2 for `OPEN_APP`) reached |

Notes:
- **Success path** does not live here. `SaveResponseInOnyx` applies the server's `onyxData` + `successData` + `finallyData`; for WRITE-type responses that is routed through [`QueuedOnyxUpdates`](#queuedonyxupdates-and-queueflusheddata) (deferred until drain).
- **`shouldFailAllRequests` vs. give-up** differ: the former applies failure **and** finally data; the give-up branch applies **only** failure data.

**Sharp edges.** For all non-`OPEN_APP` commands, a transient-but-long backend outage that exceeds the retry cap **drops** the user's optimistic write: `failureData` is applied (not `finallyData`), the request is removed from the queue, and **no modal** is shown. The failure modal (`setIsOpenAppFailureModalOpen`) fires for `OPEN_APP` only.

---

# Runtime Dimensions

Three concerns cut across every block.

## Multi-Tab & Leader Election

> **Web-only.** On native, `ActiveClientManager.isClientTheLeader()` always returns `true` (single client), so this entire dimension is a no-op there.

**Problem it solves.** On web, `PERSISTED_REQUESTS` is a single Onyx key replicated to **every tab** of one browser. Without coordination, N tabs would each drain the shared queue and send every request N times.

**How it works today.** `flush()` hard-gates on `isClientTheLeader()` (the last GUID in the shared active-clients list wins — with an `isPromotingNewLeader` carve-out: during the `beforeunload` handoff the departing leader keeps answering `true` even when its GUID is no longer last). Only the leader drains; followers may still **enqueue** (their genuinely-new requests merge cross-tab via `requestID` not in `knownRequestIDs`) but never send. Leadership is checked **once** per flush, before the running flag flips.

**Sharp edges.**
- **Mid-flush leadership change.** Because leadership is checked once and the async `process()` recursion never re-checks, a leader tab closed/refreshed mid-request can hand leadership to a follower that flushes the same shared queue while the old request is still in flight. There is no cross-tab lock on the ongoing request — duplicate-send avoidance relies on server-side `DUPLICATE_RECORD` / `ALREADY_CREATED` reconciliation, not a lock.
- **`requestID` is per-tab, not globally unique.** It comes from a module-scoped counter initialized to a wall-clock timestamp at module load and incremented per request (stamped as `requestIndex`; `requestID` is the legacy fallback name); each tab has its own counter. Timestamp seeding *reduces* but does not *eliminate* cross-tab `requestID` collisions, which the `knownRequestIDs` cross-tab diff relies on.

## Offline Behavior

**Problem it solves.** Let the user keep working with no connection; deliver their writes when connectivity returns.

**How it works today.** `getIsOffline()` (from `NetworkState`, read synchronously) gates `push`, `flush`, and `process`. Offline, `push` persists and returns without flushing. On reconnect, `Reconnect` calls `SequentialQueue.flush()` from two edges — the offline→online `NetworkState` transition and the app-became-active listener — deliberately separate from its `reconnect()` data-sync, which never flushes (see [Inbound Consumers](#inbound-consumers-who-calls-the-queue)). The queue does **not** own offline *detection* — see [Network State Detection](NETWORK_STATE_DETECTION.md) for the hard-stop model and recovery probes.

## Pausing & Data-Gap Sync

**Problem it solves.** The server tags WRITE responses with update IDs. If the client has missed intermediate updates (a gap between `lastUpdateIDAppliedToClient` and the response's `previousUpdateID`), applying further buffered WRITE responses would put Onyx data out of causal order. The queue must pause until the gap is filled.

**How it works today.** `SaveResponseInOnyx` is the **sole producer** of `shouldPauseQueue`: it sets the flag when the command is not in `requestsToIgnoreLastUpdateID` and `OnyxUpdates.doesClientNeedToBeUpdated` reports a `previousUpdateID` gap, after stashing the update info. `process()` then `pause()`s — the flag flips first, but the just-processed request is still removed and its `queueFlushedData` saved before the recursion early-returns on the pause. The actual gap fetch runs in a **decoupled** `OnyxUpdateManager` flow that fetches the missing range, applies the deferred updates in order, and then calls `unpause()`. Within this concern `pause()` has two inbound callers — `applyOnyxUpdatesReliably` (on detecting a missing-updates fetch) and `DeferredOnyxUpdates` — with `unpause()` called once the gap is filled.

**Sharp edges.**
- The in-code source comment at the `resolveIsReadyPromise` decision claims `isQueuePaused` is set for offline pauses as well as `shouldPauseQueue` data-gap syncs. That is **inaccurate**: no offline path ever calls `pause()` (its only callers are the `shouldPauseQueue` response, `DeferredOnyxUpdates`, and `applyOnyxUpdatesReliably`); offline is handled entirely by the separate `isOfflineNetwork()` gate. The decision logic itself is correct — it keys on `isOfflineNetwork()` — only the explanatory comment is wrong (see [the state machine](#why-isreadypromise-resolves-on-offline-not-on-paused)).
- `shouldPauseQueue` rides on the response object, so any middleware registered after `SaveResponseInOnyx` that returned a *new* response object would strip the flag. Today the only later middleware is `FraudMonitoring`, which returns the response unchanged — so the flag survives, but the in-code comment claiming `SaveResponseInOnyx` "must be last" is stale (see [Middleware](#the-middleware-chain-boundary)).

---

# The Middleware Chain (boundary)

**Problem it solves (for the queue).** `process()` hands a request to `processWithMiddleware` and gets back a single promise that either resolves (success, possibly with `shouldPauseQueue`) or rejects (an error the ladder can classify). The chain is where the XHR, auth, response persistence, and optimistic-ID repair happen.

**How it works today.**
- **Registration order:** `Logging`, `LoadTest`, `FailureTracking`, `Reauthentication`, `handleDeletedAccount`, `SupportalPermission`, `HandleUnusedOptimisticID`, `Pagination`, `SentryServerTiming`, `SaveResponseInOnyx`, `FraudMonitoring`.
- **Execution model.** `processWithMiddleware` folds the chain with `reduce`, seeding from `makeXHR(request)`. Each middleware appends its own `.then` to the promise it receives. So the **first-registered** middleware (`Logging`) wraps the raw XHR and its response handler fires **first**; the **last-registered** (`FraudMonitoring`) fires **last**. **Response handlers fire in registration order** (not the reverse).
- **`isFromSequentialQueue = true`** changes exactly one middleware behavior: `Reauthentication` **re-throws** on failure so the queue's catch can retry (rather than resolving a callback). The `QueuedOnyxUpdates` routing in `SaveResponseInOnyx` is **not** keyed on this flag — it is keyed on `request.data.apiRequestType === WRITE` in `applyHTTPSOnyxUpdates` (see [QueuedOnyxUpdates](#queuedonyxupdates-and-queueflusheddata)), which for queue traffic amounts to the same thing.
- **`SaveResponseInOnyx`** is the penultimate middleware and the sole producer of `shouldPauseQueue`.
- **`Reauthentication`** reacts to a 407 (`NOT_AUTHENTICATED`), which arrives as a *resolved* response (data), by reauthenticating. On the sequential-queue path it re-runs the chain; if reauth ultimately fails it throws `new Error('Failed to reauthenticate')`. On reauth **success** the ongoing request stays promoted and is re-driven in place (no rollback, no dequeue); only reauth **failure** escapes to the generic ladder, which rolls the ongoing request back to the queue head and retries with backoff. `HandleUnusedOptimisticID` is the path that mutates the ongoing request in place (via `updateOngoingRequest`) during such a re-run.

**Sharp edges.**
- The chain order is implicit import-time module state; there is no runtime assertion that `SaveResponseInOnyx` is penultimate or that `Reauthentication` precedes it.
- `SaveResponseInOnyx`'s early-return guard has a **dead term**: `onyxUpdates` defaults to `response.onyxData ?? []`, and an empty array is truthy, so the `!onyxUpdates` leg of the guard is never true — a response's empty `onyxData` cannot short-circuit the middleware. The sibling `successData`/`failureData`/`finallyData` legs still fire, so the `if` as a whole is not dead — only its empty-`onyxData` short-circuit is.
- The in-code "must be last" comment on `SaveResponseInOnyx` is **inaccurate**: `FraudMonitoring` is registered after it. The current order is safe only **incidentally** — `FraudMonitoring` returns the response object unchanged, so the `shouldPauseQueue` flag riding on it survives. The load-bearing invariant is "no middleware after `SaveResponseInOnyx` may mutate or replace the response," not literal lastness; nothing enforces either form.

---

# Conflict Resolution

**Problem it solves.** When a new request would conflict with one already queued (e.g. two edits to the same field, or an add-then-delete), collapse or rewrite the queue so only the correct net effect is sent. Wrappers like `writeWithNoDuplicates*` build on this.

**How it works today.** A request may carry `checkAndFixConflictingRequest`. It is evaluated **twice**:
1. **In `prepareRequest` (read-only)** against `getAll()`, solely to decide whether to suppress optimistic data (`conflictAction.type === 'noAction'`). The rest of the action is ignored here.
2. **In `push` (authoritative)** against the live persisted requests. The resolver function is deleted off the request (to keep it serializable), and the `conflictAction` is applied via `handleConflictActions`, which performs the queue mutations. The four action shapes:
   - **push** — append the new request.
   - **replace** — overwrite the request at a computed index.
   - **delete** — remove requests at computed indices, optionally push a new request and/or recurse into a `nextAction` (`pushNewRequest` is a required boolean on the type; the optionality is behavioral).
   - **noAction** — ignore the new request.

**Sharp edges.**
- **Index fragility.** `replace`/`delete` carry **numeric indices** computed by the resolver at `push` time, but `handleConflictActions` applies them **asynchronously** (awaiting between positional operations). Meanwhile `processNextRequest` (`slice(1)`), `endRequestAndRemoveFromQueue` (splice), and cross-tab merges can shift indices. An index computed against one snapshot may point at a different request by the time it is applied.
- **Conflict checking sees only the queue, never the in-flight `ongoingRequest`** — a new write cannot dedupe against a request that is already being sent.
- The resolver is expected to be pure, but production resolvers are not: `resolveCommentDeletionConflicts` performs an `Onyx.update`, and because `prepareRequest` invokes the **same** closure, the side effect fires on **both** evaluations (twice per write; an idempotent merge today). `resolveEditCommentWithNewAddCommentRequest` goes further and mutates the queued request's `data` in place during evaluation.

---

# Test Coverage

Tests are useful here as evidence of the **intended contract** — what the team asserts as a guarantee. (Stated as observation; gaps below are facts, not a to-do list.)

| Suite | What it pins as contract |
|---|---|
| `tests/unit/APITest.ts` | Offline-persist, online-flush, persisted-until-backend-response, retry/backoff for 5xx + Auth-down (asserts ~3 fetches with throttle waits), reauthentication + ordering, WRITE-blocks-READ, pause/unpause, no-duplicates + enable-feature conflict collapsing, supportal-411 no-retry + `failureData` |
| `tests/unit/SequentialQueueTest.ts` | Push/persist counts, conflict resolution (replace/push/noAction, incl. replace-while-ongoing — now `async`/awaited since `push` is async), move-to-ongoing persistence, startup hydration of the ongoing request, `queueFlushedData` lifecycle, `ALREADY_CREATED` treated as success without retry, **and the persist-before-fire edges: `waitForIdle` resolves without flushing when the network goes offline during persist, and a disk-write failure during persist does not strand `isReadyPromise` or block the queue** |
| `tests/unit/PersistedRequests.ts` | Save/remove/processNext/update/updateOngoing, File/Blob handling, cross-tab follower reconciliation; the `Issue 3a`/`3c` cases assert the **durable** ongoing-request behavior (`processNextRequest` always persists via `multiSet`) — a legacy test title references the vestigial `persistWhenOngoing` flag |
| `tests/unit/RequestConflictUtilsTest.ts` | Pure push/replace/delete/noAction resolver logic |
| `tests/actions/QueuedOnyxUpdatesTest.ts` | Account-scoped update filtering on flush |
| `tests/unit/MiddlewareTest.ts` | `SaveResponseInOnyx` and `HandleUnusedOptimisticID` |
| `tests/unit/ReconnectTest.ts` | The offline→online transition flushes the queue exactly once |
| `tests/actions/OnyxUpdateManagerTest.ts` | The queue is paused while a missing-updates gap is fetched, and resumed after |

The suites rely on `resetQueue()` (resets the four core coordinator vars — running flag, `currentRequestPromise`, pause flag, `isReadyPromise` — but not `shouldFailAllRequests`, `queueFlushedDataToStore`, or the throttle) and `resetPendingWritesForTest()` (resets only the `pendingOnyxWrites` counter) — test-only reset primitives, the pendants to `clear()`.

**Untested on this branch (factual):**
- The **give-up-after-max-retries** branch (apply `failureData`, dequeue, open the `OPEN_APP` failure modal) — all retry tests recover within 1–3 attempts.
- A **dedicated `RequestThrottle` unit** — its backoff math and reject threshold are exercised only indirectly via the shared instance's wait-time getter.
- The **non-leader `flush` guard** — only follower disk reconciliation is covered, not the early return.
- **True mid-flight-crash-then-restart recovery** — startup hydration is simulated by manually seeding `PERSISTED_ONGOING_REQUESTS`.
- **`waitForIdle` is used only as a drain helper** in tests (pagination, attachments, workspace-upgrade, network, middleware), never asserted as a READ-blocks-on-WRITE ordering guarantee.

**Two distinct orderings — don't conflate them.** Persist-before-**fire** (await the disk commit before the network XHR) is in effect today and is the behavior described throughout this doc. Persist-before-**optimistic** (persist the request *before* applying `optimisticData` to Onyx in `prepareRequest`) is a *separate*, still-open ordering: `optimisticData` is applied in `prepareRequest`, before `push` is ever called, so the persist-before-fire await does not affect it. `APITest.ts` › `API.write() persistence guarantees` › `'Issue 1: should persist the request before applying optimistic data'` asserts `optimisticDataApplied === true` and `requestPersistedBeforeOptimistic === false` — it pins that optimistic-before-persist ordering, and its "flip the final assertion" comment refers to the persist-before-optimistic fix (not yet shipped). The sibling `Issue 2` case stalls the write promise on an unresolved `PERSISTED_REQUESTS` `Onyx.set`, asserting `push` awaits persistence (the current persist-before-fire behavior), though its describe-block header comment still reads "BUG" — an upstream test inconsistency, not a behavior claim of this doc.

---

# Configuration Constants

Defined in `src/CONST/index.ts` under `CONST.NETWORK` (retry/backoff subset relevant to the queue; the sustained-failure constants are documented in [Network State Detection](NETWORK_STATE_DETECTION.md)):

| Constant | Value | Description |
|---|---|---|
| `MAX_REQUEST_RETRIES` | `10` | Retry cap for normal commands before give-up |
| `MAX_OPEN_APP_REQUEST_RETRIES` | `2` | Retry cap for the `OPEN_APP` command |
| `MIN_RETRY_WAIT_TIME_MS` | `10` | Lower bound of the first-retry jitter |
| `MAX_RANDOM_RETRY_WAIT_TIME_MS` | `100` | Upper bound of the first-retry jitter |
| `MAX_RETRY_WAIT_TIME_MS` | `10000` (10 s) | Cap for the doubling backoff |

> There is **no** constant named `MIN_RANDOM_RETRY_WAIT_TIME_MS`; the jitter lower bound is `MIN_RETRY_WAIT_TIME_MS`. `CONST.JSON_CODE.NOT_AUTHENTICATED = 407` (used by `Reauthentication`) is defined elsewhere in `CONST`, not under `NETWORK`.

---

# Key Modules Reference

| Module | Responsibility |
|---|---|
| `src/libs/Network/SequentialQueue.ts` | Leader-tab serial executor for persisted WRITE requests: persist-then-flush one at a time through the middleware with throttle/backoff and the error ladder; gates dependent READs via `isReadyPromise`. |
| `src/libs/actions/PersistedRequests.ts` | In-memory mirror (`persistedRequests` + `ongoingRequest`) of the offline write queue, reconciled with the `PERSISTED_REQUESTS` / `PERSISTED_ONGOING_REQUESTS` keys; in-memory authoritative after init. |
| `src/libs/RequestThrottle.ts` | Per-instance exponential-backoff timing: jittered first wait, doubling capped at the max, retry-count gate, argument-less reject as the give-up signal. |
| `src/libs/actions/QueuedOnyxUpdates.ts` | In-memory buffer of WRITE-response Onyx updates, held until the queue drains then flushed (with a not-signed-in preserved-keys filter) — anti-flicker. |
| `src/libs/actions/OnyxUpdates.ts` (`applyHTTPSOnyxUpdates`) | Routes WRITE-type responses through `queueOnyxUpdates` and READ-type through `Onyx.update` immediately; home of `doesClientNeedToBeUpdated`. |
| `src/libs/API/index.ts` | Public facade: `prepareRequest` applies optimistic data + stamps `requestID`; routes `write`→queue, `read`→`waitForWrites` then fire-and-forget, `makeRequestWithSideEffects`→immediate. |
| `src/libs/Request.ts` (`processWithMiddleware`) | Folds the middleware chain over `makeXHR(request)`; first-registered is innermost, response handlers fire in registration order. |
| `src/libs/Middleware/SaveResponseInOnyx.ts` | Penultimate middleware; sole producer of `shouldPauseQueue` (on a `previousUpdateID` gap); persists server Onyx updates. |
| `src/libs/Middleware/Reauthentication.ts` | Re-throws on `isFromSequentialQueue` so the queue retries; reacts to 407 by reauthenticating; may throw `new Error('Failed to reauthenticate')`. |
| `src/libs/ActiveClientManager/` | Leader election across web tabs (`isClientTheLeader`); no-op (always leader) on native. |
| `QUEUE_FLUSHED_DATA` (Onyx key) + `SequentialQueue.saveQueueFlushedData` | Distinct Onyx-persisted buffer applied only on full drain; sole producer is `App.getOnyxDataForOpenOrReconnect` carrying `HAS_LOADED_APP = true`. |

---

# Relationship to Other Docs

- [Network State Detection](NETWORK_STATE_DETECTION.md) — **how** the app detects connectivity and decides it is offline (the hard-stop model the queue's `getIsOffline()` gate reads).
- [Offline UX Patterns](philosophies/OFFLINE.md) — **how features should respond** to being offline (optimistic patterns A/B/C/D), which the `API.write`/`read` contract implements.
