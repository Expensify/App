import CONST from '@src/CONST';

import type {OnyxKey} from 'react-native-onyx';

/**
 * Coordinates deferred API.write() calls with screen content layout transitions.
 *
 * Problem: API.write() applies optimistic Onyx data synchronously, which triggers
 * expensive collection-level re-renders. When navigating to a screen after an action
 * like expense creation, firing this during the skeleton->content transition blocks
 * the JS thread and makes the skeleton hang.
 *
 * Solution: The action registers its write via `registerDeferredWrite(key, cb)`;
 * the target component flushes it from its content onLayout callback via `flushDeferredWrite(key)`.
 * A per-record safety timeout (default 5s) marks the record's layout stale if the
 * target component never lays out, but does not delete it - a record is only removed
 * when its write executes or it is explicitly abandoned (see `abandonDeferredWrite`).
 * That is a single source of truth: `channels` and `pendingRegistrations` used to be two
 * maps with independent lifetimes, which let a reservation's timeout disagree with the
 * registration side about whether a write was still pending.
 *
 * Every reservation exits `reserved` one of three ways: registration (the real write
 * arrives), abandonment (an owning component unmounts before it could register - see
 * `abandonDeferredWrite`), or - once registered - execution. App backgrounding does NOT
 * abandon a reservation: it only pauses whatever is waiting to register (e.g. a throttled
 * requestAnimationFrame), which still fires on resume, so abandoning there would resolve a
 * submit-waiter before the write it is waiting for actually lands. A reservation with no
 * component to hang an unmount cleanup on (e.g. `submitWithDismissFirst.ts`) instead relies
 * on its `runAfterTransitions` caller guaranteeing registration - see the comment there.
 *
 * Note: The Search component has its own 10s safety timeout (clearOptimisticTracking)
 * for the UI-level optimistic item cache. The two timeouts serve different layers:
 *   - 5s (here): guarantees the API.write() executes.
 *   - 10s (Search): guarantees the skeleton/ghost-row UI clears if the optimistic
 *     item never reaches sortedData (e.g. empty list, API failure, offline).
 */
import {AppState} from 'react-native';

import Log from './Log';

const DEFAULT_SAFETY_TIMEOUT_MS = 5000;

type DeferredWriteState = 'reserved' | 'registered';

type DeferredWrite = {
    state: DeferredWriteState;

    /** The real API write callback. Only set once `state` is 'registered'. */
    write?: () => void;

    /**
     * An Onyx key that the deferred write will create via optimistic data.
     * Consumer components can subscribe to this key with useOnyx to know
     * when the optimistic updates have been applied.
     */
    optimisticWatchKey?: OnyxKey;

    /**
     * Report ID of the destination report the deferred write targets, when applicable.
     * Used by consumer components (loading skeletons, empty-state suppression) to scope
     * their "is a write in flight?" check to the report the user is actually viewing,
     * instead of treating the record as a global flag.
     */
    destinationReportID?: string;

    /**
     * Set when flushDeferredWrite is called while the record is still reserved.
     * Signals that the target component already laid out and tried to flush,
     * so registerDeferredWrite should execute the real callback immediately
     * instead of leaving a record that nobody will flush.
     */
    flushRequested: boolean;

    /**
     * True once the reservation's safety timeout fires without a real registration.
     * This is what the old design signalled by deleting the channel outright - but
     * doing that also erased the fact that a real write was still forthcoming, which
     * is exactly what `isWritePending` needs to keep seeing. `isLayoutPending` goes
     * false the moment this flips; `isWritePending` does not.
     */
    isLayoutStale: boolean;

    safetyTimeoutId: ReturnType<typeof setTimeout>;

    /** Only present while `state === 'reserved'`. Lets a caller await the real registration. */
    registration?: {promise: Promise<void>; resolve: () => void};
};

const writes = new Map<string, DeferredWrite>();

// Watch keys that outlive their record. When a reserved record is flushed
// immediately (flushRequested path), the record is deleted but the watch key
// must remain accessible so Search's lazy getOptimisticWatchKey() resolution
// can still find it.
const flushedWatchKeys = new Map<string, OnyxKey>();

type DeferredWriteOptions = {
    safetyTimeoutMs?: number;
    optimisticWatchKey?: OnyxKey;
    destinationReportID?: string;
};

/**
 * Register a callback to be executed when the target component lays out.
 * If a previous write for the same key is still pending it is flushed
 * immediately before registering the new one.
 */
function registerDeferredWrite(key: string, callback: () => void, options: DeferredWriteOptions = {}) {
    const {safetyTimeoutMs = DEFAULT_SAFETY_TIMEOUT_MS, optimisticWatchKey, destinationReportID: callerDestinationReportID} = options;

    const existing = writes.get(key);

    // Guards against a write for one report silently consuming another report's still-unresolved
    // reservation on the same global key (SEARCH/DISMISS_MODAL are not per-report). Only compares
    // when both sides actually supply a destinationReportID - fails open (allows the consume) when
    // either side is unscoped, since a false mismatch would leave the rightful reservation's
    // registration unresolved forever (no safety net resolves it once this bypasses the normal
    // handoff). When a real mismatch is detected, run the caller's write immediately and leave the
    // existing reservation untouched for its rightful owner.
    const reservedReportID = existing?.state === 'reserved' ? existing.destinationReportID : undefined;
    if (reservedReportID && callerDestinationReportID && reservedReportID !== callerDestinationReportID) {
        callback();
        return;
    }

    // Preserve the destination report ID across the reservation -> registration handoff so
    // scoped consumers (`isLayoutPendingForReport` / `isWritePendingForReport`) keep matching
    // after the real callback replaces the reservation. Falls back to the caller's own
    // destinationReportID when there was no reservation to inherit from (e.g. deferOrExecuteWrite's
    // unconditional SEARCH registration) - without this, a freshly-registered write is unscoped and
    // ReportWorkflow's isWritePendingForReport flush check can't find it, so submit dispatches
    // without flushing it first, reproducing the create-after-submit race this module exists to fix.
    const destinationReportID = reservedReportID ?? callerDestinationReportID;
    let registration = existing?.registration;

    if (existing) {
        if (existing.state === 'reserved') {
            clearTimeout(existing.safetyTimeoutId);

            if (existing.flushRequested) {
                if (optimisticWatchKey) {
                    flushedWatchKeys.set(key, optimisticWatchKey);
                }
                writes.delete(key);
                callback();
                registration?.resolve();
                return;
            }
        } else {
            Log.warn(`[DeferredLayoutWrite] Overwriting unflushed deferred write for key "${key}" - flushing the pending one first`);
            flushDeferredWrite(key);
            registration = undefined;
        }
    }

    const safetyTimeoutId = setTimeout(() => {
        Log.warn(`[DeferredLayoutWrite] Safety timeout (${safetyTimeoutMs}ms) fired for key "${key}" - the target component likely never laid out`);
        flushDeferredWrite(key);
    }, safetyTimeoutMs);

    writes.set(key, {
        state: 'registered',
        write: callback,
        safetyTimeoutId,
        optimisticWatchKey,
        destinationReportID,
        flushRequested: false,
        isLayoutStale: false,
        registration,
    });
    registration?.resolve();
}

/**
 * Execute and clear the pending deferred write for the given key.
 * Called by the target component when actual content (not skeleton) lays out.
 *
 * If the record is still reserved (real callback not yet registered), the
 * flush is deferred: the record is marked `flushRequested` so that
 * registerDeferredWrite will execute the real callback immediately when it
 * arrives, instead of creating a record that nobody would flush.
 */
function flushDeferredWrite(key: string) {
    const record = writes.get(key);
    if (!record) {
        return;
    }

    if (record.state === 'reserved') {
        record.flushRequested = true;
        return;
    }

    clearTimeout(record.safetyTimeoutId);
    writes.delete(key);
    record.write?.();
}

/**
 * Abandon a reservation without executing anything, resolving its registration promise
 * so a submit-waiter does not hang forever. Only meaningful for a still-`reserved` record -
 * a `registered` write has a real callback to run, not to drop, so it is left untouched.
 *
 * Resolves unconditionally whenever a reserved record exists, with no extra existence gate
 * beyond that lookup: the old two-map design could have a reservation's safety timeout
 * delete the channel out from under a caller trying to cancel it, silently turning cancel
 * into a no-op. A record here is never deleted by its own timeout (only marked stale), so
 * this always reaches the resolve.
 */
function abandonDeferredWrite(key: string) {
    const record = writes.get(key);
    if (record?.state !== 'reserved') {
        return;
    }
    clearTimeout(record.safetyTimeoutId);
    writes.delete(key);
    record.registration?.resolve();
}

/**
 * Pre-create a record so that isLayoutPending(key) returns true immediately.
 * The real callback will be registered later via registerDeferredWrite, which
 * replaces the reservation. A safety timeout marks the reservation's layout
 * stale if the real registration never arrives - it does not delete the
 * record, since a write may still be forthcoming.
 *
 * Pass `destinationReportID` to pair the reservation with the report the
 * deferred write will land in, so consumers can scope their "is a write in
 * flight for THIS report?" check via `isLayoutPendingForReport` / `isWritePendingForReport`.
 *
 * Returns whether this call actually created (or re-armed) the reservation, as opposed to
 * no-opping because one already existed. Callers that plan to `abandonDeferredWrite` this key
 * later (e.g. on unmount) MUST check this first - `abandonDeferredWrite` operates on the key, not
 * on a per-caller handle, so abandoning after a no-op reservation would delete a DIFFERENT
 * caller's still-live reservation instead of your own.
 */
function reserveDeferredWriteChannel(key: string, options: {destinationReportID?: string} = {}): boolean {
    const existing = writes.get(key);

    if (existing) {
        if (existing.state === 'registered') {
            // A real write is already pending on this key; do not clobber it with a reservation.
            return false;
        }

        if (existing.isLayoutStale) {
            // The previous reservation's safety timeout already fired with nothing registered.
            // Re-arm rather than no-op: a second flow reserving the same key after that point
            // still deserves layout-pending visibility and its own fresh safety window. Still not
            // "ours" for abandonment purposes though - it keeps the original destinationReportID,
            // not this caller's, so this caller must not treat it as its own to abandon later.
            existing.isLayoutStale = false;
            clearTimeout(existing.safetyTimeoutId);
            existing.safetyTimeoutId = setTimeout(() => {
                Log.warn(`[DeferredLayoutWrite] Safety timeout fired for reserved channel "${key}" - the real write was never registered`);
                const record = writes.get(key);
                if (record) {
                    record.isLayoutStale = true;
                }
            }, DEFAULT_SAFETY_TIMEOUT_MS);
        }
        return false;
    }

    flushedWatchKeys.delete(key);

    let resolveRegistration: () => void = () => {};
    const registrationPromise = new Promise<void>((resolve) => {
        resolveRegistration = resolve;
    });

    const safetyTimeoutId = setTimeout(() => {
        Log.warn(`[DeferredLayoutWrite] Safety timeout fired for reserved channel "${key}" - the real write was never registered`);
        const record = writes.get(key);
        if (record) {
            record.isLayoutStale = true;
        }
    }, DEFAULT_SAFETY_TIMEOUT_MS);

    writes.set(key, {
        state: 'reserved',
        destinationReportID: options.destinationReportID,
        flushRequested: false,
        isLayoutStale: false,
        safetyTimeoutId,
        registration: {promise: registrationPromise, resolve: resolveRegistration},
    });
    return true;
}

/**
 * True when a record exists for `key` and its layout has not gone stale. Drives skeleton /
 * empty-state suppression - what "delete the channel" used to signal for those consumers.
 */
function isLayoutPending(key: string): boolean {
    const record = writes.get(key);
    return !!record && !record.isLayoutStale;
}

/**
 * Scoped variant of `isLayoutPending`. Records stored without a destination (e.g. SEARCH-flow
 * writes, or DISMISS_MODAL reservations made before the destination is known) never match -
 * callers should fall back to `isLayoutPending` if they need the global flag.
 */
function isLayoutPendingForReport(key: string, reportID: string | undefined): boolean {
    if (!reportID) {
        return false;
    }
    const record = writes.get(key);
    return !!record && !record.isLayoutStale && record.destinationReportID === reportID;
}

/**
 * True when a record exists for `key`, regardless of layout staleness. Used for
 * `deferOrExecuteWrite` gating and reservation dedupe, where what matters is whether a write
 * (real or still-reserved) is outstanding, not whether its target has laid out yet.
 */
function isWritePending(key: string): boolean {
    return writes.has(key);
}

/** Scoped variant of `isWritePending`, ignoring layout staleness. Used by submit-side flush checks. */
function isWritePendingForReport(key: string, reportID: string | undefined): boolean {
    if (!reportID) {
        return false;
    }
    return writes.get(key)?.destinationReportID === reportID;
}

/**
 * Returns a promise that resolves once the reservation for `key` targeting `reportID` gets its
 * real callback registered. Returns undefined when there is no matching reservation, so callers
 * can distinguish "nothing to wait for" from "already resolved". Used by callers that cannot
 * register on the record themselves (e.g. submitReport) but must not race ahead of a pending
 * create still waiting on the reservation.
 */
function getRegistrationPromiseForReport(key: string, reportID: string | undefined): Promise<void> | undefined {
    if (!reportID) {
        return undefined;
    }
    const record = writes.get(key);
    if (record?.state !== 'reserved' || record.destinationReportID !== reportID) {
        return undefined;
    }
    return record.registration?.promise;
}

/**
 * Returns the Onyx key that the deferred write for the given record will
 * create via optimistic data. Returns undefined when no record is registered
 * or the record was registered without a watch key.
 */
function getOptimisticWatchKey(key: string): OnyxKey | undefined {
    const recordKey = writes.get(key)?.optimisticWatchKey;
    if (recordKey) {
        return recordKey;
    }
    return flushedWatchKeys.get(key);
}

// Flush every pending deferred write when the app moves to background so that API.write() calls
// are persisted to the SequentialQueue before the OS can kill the process.
//
// A still-`reserved` record is deliberately NOT abandoned here, even with no `flushRequested`:
// backgrounding pauses (does not cancel) whatever is waiting to register the real write - a
// throttled requestAnimationFrame resumes and still fires once the app comes back to the
// foreground. Abandoning would resolve a submit-waiter's registration promise while that write is
// still genuinely forthcoming, so it would land its API.write() *after* SUBMIT_REPORT once the
// rAF finally runs - reproducing the exact create-after-submit race this module exists to prevent.
// If the process is killed instead of resumed, the module's in-memory state (and the abandoned rAF
// itself) dies with it - no leak, and no submit is dispatched either, which is the better failure
// mode (see the "app kill vs background" caveat in the PR description).
AppState.addEventListener('change', (nextState) => {
    if (nextState === 'active' || writes.size === 0) {
        return;
    }
    Log.info(`[DeferredLayoutWrite] App going to "${nextState}" - flushing ${writes.size} pending deferred write(s)`);
    for (const key of [...writes.keys()]) {
        flushDeferredWrite(key);
    }
});

/**
 * Decide whether to defer the API write behind a pending layout transition
 * (Search pre-insert or dismiss-modal) or execute it immediately.
 *
 * Priority order (first match wins):
 *   1. SEARCH channel  - checked via the caller-provided `shouldDeferForSearch` flag
 *   2. DISMISS_MODAL   - checked automatically via `isWritePending`
 *   3. Immediate exec  - no active record, run now
 *
 * Callers pre-compute `shouldDeferForSearch` using their own eligibility logic.
 * The dismiss-modal record is detected automatically via `isWritePending`.
 */
function deferOrExecuteWrite(
    apiWrite: () => void,
    options: {shouldDeferForSearch: boolean; isRetry?: boolean; optimisticWatchKey?: OnyxKey; onDeferred?: () => void; destinationReportID?: string},
) {
    const {shouldDeferForSearch, isRetry = false, optimisticWatchKey, onDeferred, destinationReportID} = options;

    if (shouldDeferForSearch) {
        onDeferred?.();
        registerDeferredWrite(CONST.DEFERRED_LAYOUT_WRITE_KEYS.SEARCH, apiWrite, {optimisticWatchKey, destinationReportID});
        return;
    }

    // Retries skip deferral to avoid infinite loops (retry -> defer -> flush -> retry).
    // The trade-off is that a retry's optimistic data may be applied mid-animation,
    // but this is acceptable: retries are rare and the alternative is a stuck write.
    if (!isRetry && isWritePending(CONST.DEFERRED_LAYOUT_WRITE_KEYS.DISMISS_MODAL)) {
        onDeferred?.();
        registerDeferredWrite(CONST.DEFERRED_LAYOUT_WRITE_KEYS.DISMISS_MODAL, apiWrite, {optimisticWatchKey, destinationReportID});
        return;
    }

    // Fallback: a reserved SEARCH channel (created by handleSearchDismiss before
    // createTransaction) that wasn't matched by the explicit shouldDeferForSearch flag.
    if (!isRetry && isWritePending(CONST.DEFERRED_LAYOUT_WRITE_KEYS.SEARCH)) {
        onDeferred?.();
        registerDeferredWrite(CONST.DEFERRED_LAYOUT_WRITE_KEYS.SEARCH, apiWrite, {optimisticWatchKey, destinationReportID});
        return;
    }

    apiWrite();
}

/**
 * Clear all records and flushed watch keys, resolving any outstanding registration promises
 * first. Only for use in tests. Exported from production code (rather than a test helper) so
 * jest.mock can auto-resolve it alongside the other exports. Gated behind __DEV__ so the
 * function is a no-op in production (bundler dead-code eliminates the branch).
 */
function resetForTesting() {
    if (!__DEV__) {
        return;
    }
    for (const record of writes.values()) {
        clearTimeout(record.safetyTimeoutId);
        record.registration?.resolve();
    }
    writes.clear();
    flushedWatchKeys.clear();
}

export {
    registerDeferredWrite,
    reserveDeferredWriteChannel,
    flushDeferredWrite,
    abandonDeferredWrite,
    isLayoutPending,
    isLayoutPendingForReport,
    isWritePending,
    isWritePendingForReport,
    getRegistrationPromiseForReport,
    getOptimisticWatchKey,
    deferOrExecuteWrite,
    resetForTesting,
};
