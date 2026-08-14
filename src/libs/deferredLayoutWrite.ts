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
 * A per-channel safety timeout (default 5s) ensures the write always fires even if
 * the target screen never mounts or the user navigates elsewhere.
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

type DeferredChannel = {
    write: () => void;
    safetyTimeoutId: ReturnType<typeof setTimeout>;

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
     * instead of treating the channel as a global flag.
     */
    destinationReportID?: string;

    /** True when the channel was created by reserveDeferredWriteChannel. */
    isReserved?: boolean;

    /**
     * Set when flushDeferredWrite is called while the channel is still reserved.
     * Signals that the target component already laid out and tried to flush,
     * so registerDeferredWrite should execute the real callback immediately
     * instead of creating a new deferred channel.
     */
    flushRequested?: boolean;
};

const channels = new Map<string, DeferredChannel>();

// Resolver + destinationReportID for a reservation, keyed independently of `channels` so a
// reservation's safety timeout can delete the channel (for hasDeferredWrite/flush purposes)
// without also resolving this or losing the report scoping - the resolver must only fire once
// the real callback actually registers, and that late registration still needs the original
// destinationReportID (the timeout wipes it from `channels`) so hasDeferredWriteForReport keeps
// matching it. Every reserveDeferredWriteChannel call site unconditionally follows up with the
// real write, so resolving early or dropping the scope on the timeout would let a submit-waiter proceed (or
// fail to flush) before that write lands, reproducing the exact submit-before-create race this
// mechanism exists to prevent.
const pendingRegistrations = new Map<string, {resolve: () => void; destinationReportID?: string; promise: Promise<void>}>();

// Watch keys that outlive their channel. When a reserved channel is flushed
// immediately (flushRequested path), the channel is deleted but the watch key
// must remain accessible so Search's lazy getOptimisticWatchKey() resolution
// can still find it.
const flushedWatchKeys = new Map<string, OnyxKey>();

function clearChannelTimeout(channel: DeferredChannel) {
    clearTimeout(channel.safetyTimeoutId);
}

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

    // Preserve the destination report ID across the reservation -> registration handoff so
    // scoped consumers (`hasDeferredWriteForReport`) keep matching after the real callback
    // replaces the reserved channel. Falls back to `pendingRegistrations` because the
    // reservation's safety timeout may have already deleted `channels`' copy.
    let destinationReportID: string | undefined = pendingRegistrations.get(key)?.destinationReportID;

    const existing = channels.get(key);

    // Guards against a write for one report silently consuming another report's still-unresolved
    // reservation on the same global key (SEARCH/DISMISS_MODAL are not per-report). Only compares
    // when both sides actually supply a destinationReportID - fails open (allows the consume) when
    // either side is unscoped, since a false mismatch would leave the rightful reservation's
    // pendingRegistrations entry unresolved forever (no safety net resolves it once this bypasses
    // the normal handoff). When a real mismatch is detected, run the caller's write immediately and
    // leave the existing reservation/pendingRegistrations entry untouched for its rightful owner.
    let reservedReportID: string | undefined;
    if (existing?.isReserved) {
        reservedReportID = existing.destinationReportID;
    } else if (!existing) {
        reservedReportID = pendingRegistrations.get(key)?.destinationReportID;
    }
    if (reservedReportID && callerDestinationReportID && reservedReportID !== callerDestinationReportID) {
        callback();
        return;
    }

    if (existing) {
        if (existing.isReserved) {
            destinationReportID = existing.destinationReportID;
            clearChannelTimeout(existing);
            const shouldFlushImmediately = existing.flushRequested;
            channels.delete(key);

            if (shouldFlushImmediately) {
                if (optimisticWatchKey) {
                    flushedWatchKeys.set(key, optimisticWatchKey);
                }
                callback();
                resolvePendingRegistration(key);
                return;
            }
        } else {
            Log.warn(`[DeferredLayoutWrite] Overwriting unflushed deferred write for key "${key}" - flushing the pending one first`);
            flushDeferredWrite(key);
        }
    }

    const safetyTimeoutId = setTimeout(() => {
        Log.warn(`[DeferredLayoutWrite] Safety timeout (${safetyTimeoutMs}ms) fired for key "${key}" - the target component likely never laid out`);
        flushDeferredWrite(key);
    }, safetyTimeoutMs);

    channels.set(key, {write: callback, safetyTimeoutId, optimisticWatchKey, destinationReportID});
    resolvePendingRegistration(key);
}

function resolvePendingRegistration(key: string) {
    const pending = pendingRegistrations.get(key);
    if (!pending) {
        return;
    }
    pendingRegistrations.delete(key);
    pending.resolve();
}

/**
 * Execute and clear the pending deferred write for the given key.
 * Called by the target component when actual content (not skeleton) lays out.
 *
 * If the channel is still reserved (real callback not yet registered), the
 * flush is deferred: the channel is marked `flushRequested` so that
 * registerDeferredWrite will execute the real callback immediately when it
 * arrives, instead of creating a new channel that nobody would flush.
 */
function flushDeferredWrite(key: string) {
    const channel = channels.get(key);
    if (!channel) {
        return;
    }

    if (channel.isReserved) {
        channel.flushRequested = true;
        return;
    }

    clearChannelTimeout(channel);
    channels.delete(key);
    channel.write();
}

/**
 * Cancel a pending deferred write without executing the callback.
 * Clears the safety timeout. No-op if no channel is registered for the key.
 */
function cancelDeferredWrite(key: string) {
    const channel = channels.get(key);
    if (!channel) {
        return;
    }
    clearChannelTimeout(channel);
    channels.delete(key);
}

/**
 * Pre-create a channel so that hasDeferredWrite(key) returns true immediately.
 * The real callback will be registered later via registerDeferredWrite, which
 * silently replaces the reservation. A safety timeout is still set in case
 * the real registration never arrives.
 *
 * Pass `destinationReportID` to pair the reservation with the report the
 * deferred write will land in, so consumers can scope their "is a write in
 * flight for THIS report?" check via `hasDeferredWriteForReport`.
 */
function reserveDeferredWriteChannel(key: string, options: {destinationReportID?: string} = {}) {
    // Also guards on pendingRegistrations, not just channels: the reservation's own safety
    // timeout can delete the channel while the real write is still forthcoming, possibly delayed
    // by the app going to background. Without this, a second reservation on the same key in that
    // window would overwrite the first one's entry here, orphaning its resolver (that submit-waiter
    // then hangs forever) and attributing the first reservation's late registration to the second
    // one's destinationReportID/promise instead.
    if (channels.has(key) || pendingRegistrations.has(key)) {
        return;
    }

    flushedWatchKeys.delete(key);

    let resolveRegistration: () => void = () => {};
    const registrationPromise = new Promise<void>((resolve) => {
        resolveRegistration = resolve;
    });
    pendingRegistrations.set(key, {resolve: resolveRegistration, destinationReportID: options.destinationReportID, promise: registrationPromise});

    // Deletes the channel (so hasDeferredWrite/flush stop treating it as pending) but does NOT
    // touch `pendingRegistrations` - every call site always follows up with the real write, so a
    // submit-waiter must keep waiting for that (and the real registration still needs the
    // destinationReportID here), not be released/unscoped early just because this cleanup
    // timeout raced ahead of the real registration, possibly delayed by the app going to background.
    const safetyTimeoutId = setTimeout(() => {
        Log.warn(`[DeferredLayoutWrite] Safety timeout fired for reserved channel "${key}" - the real write was never registered`);
        channels.delete(key);
    }, DEFAULT_SAFETY_TIMEOUT_MS);

    channels.set(key, {write: () => {}, safetyTimeoutId, isReserved: true, destinationReportID: options.destinationReportID});
}

function hasDeferredWrite(key: string): boolean {
    return channels.has(key);
}

/**
 * Scoped variant of `hasDeferredWrite`. Returns true when an active channel exists for `key`
 * (either reserved via `reserveDeferredWriteChannel` or fully registered via
 * `registerDeferredWrite`) AND its `destinationReportID` matches `reportID`. Channels stored
 * without a destination (e.g. SEARCH-flow writes, or DISMISS_MODAL reservations made before
 * the destination is known) never match - callers should fall back to `hasDeferredWrite` if
 * they need the global flag.
 */
function hasDeferredWriteForReport(key: string, reportID: string | undefined): boolean {
    if (!reportID) {
        return false;
    }
    return channels.get(key)?.destinationReportID === reportID;
}

/**
 * Returns a promise that resolves once the reservation for `key` targeting `reportID` gets its
 * real callback registered. Returns undefined when there is no matching reservation, so callers
 * can distinguish "nothing to wait for" from "already resolved". Used by callers that cannot
 * register on the channel themselves (e.g. submitReport) but must not race ahead of a pending
 * create still waiting on the reservation.
 *
 * Reads from `pendingRegistrations`, not `channels` - the reservation's safety timeout may have
 * already deleted the channel while the real write is still forthcoming, and a caller invoked in
 * that exact window must still get a promise to wait on, not `undefined` (which it would read as
 * "nothing pending" and submit right away).
 */
function getRegistrationPromiseForReport(key: string, reportID: string | undefined): Promise<void> | undefined {
    if (!reportID) {
        return undefined;
    }
    const pending = pendingRegistrations.get(key);
    if (pending?.destinationReportID !== reportID) {
        return undefined;
    }
    return pending.promise;
}

/**
 * Returns the Onyx key that the deferred write for the given channel will
 * create via optimistic data. Returns undefined when no channel is registered
 * or the channel was registered without a watch key.
 */
function getOptimisticWatchKey(key: string): OnyxKey | undefined {
    const channelKey = channels.get(key)?.optimisticWatchKey;
    if (channelKey) {
        return channelKey;
    }
    return flushedWatchKeys.get(key);
}

// Flush every pending deferred write when the app moves to background so
// that API.write() calls are persisted to the SequentialQueue before the OS
// can kill the process.
AppState.addEventListener('change', (nextState) => {
    if (nextState === 'active' || channels.size === 0) {
        return;
    }
    Log.info(`[DeferredLayoutWrite] App going to "${nextState}" - flushing ${channels.size} pending deferred write(s)`);
    for (const key of [...channels.keys()]) {
        flushDeferredWrite(key);
    }
});

/**
 * Decide whether to defer the API write behind a pending layout transition
 * (Search pre-insert or dismiss-modal) or execute it immediately.
 *
 * Priority order (first match wins):
 *   1. SEARCH channel  - checked via the caller-provided `shouldDeferForSearch` flag
 *   2. DISMISS_MODAL   - checked automatically via `hasDeferredWrite`
 *   3. Immediate exec  - no active channel, run now
 *
 * Callers pre-compute `shouldDeferForSearch` using their own eligibility logic.
 * The dismiss-modal channel is detected automatically via `hasDeferredWrite`.
 */
// `hasDeferredWrite` alone misses a channel whose safety timeout already deleted it while
// `pendingRegistrations` still has an unresolved entry (the real write is still forthcoming,
// possibly delayed by the app going to background). Gating deferOrExecuteWrite on
// `hasDeferredWrite` alone would run apiWrite() immediately instead of calling
// registerDeferredWrite, orphaning that pendingRegistrations entry forever (its resolver never
// fires, so a submit-waiter hangs and the key stays blocked for future reservations).
function hasDeferredWriteOrPendingRegistration(key: string): boolean {
    return hasDeferredWrite(key) || pendingRegistrations.has(key);
}

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
    if (!isRetry && hasDeferredWriteOrPendingRegistration(CONST.DEFERRED_LAYOUT_WRITE_KEYS.DISMISS_MODAL)) {
        onDeferred?.();
        registerDeferredWrite(CONST.DEFERRED_LAYOUT_WRITE_KEYS.DISMISS_MODAL, apiWrite, {optimisticWatchKey, destinationReportID});
        return;
    }

    // Fallback: a reserved SEARCH channel (created by handleSearchDismiss before
    // createTransaction) that wasn't matched by the explicit shouldDeferForSearch flag.
    if (!isRetry && hasDeferredWriteOrPendingRegistration(CONST.DEFERRED_LAYOUT_WRITE_KEYS.SEARCH)) {
        onDeferred?.();
        registerDeferredWrite(CONST.DEFERRED_LAYOUT_WRITE_KEYS.SEARCH, apiWrite, {optimisticWatchKey, destinationReportID});
        return;
    }

    apiWrite();
}

/**
 * Clear all channels and flushed watch keys. Only for use in tests.
 * Exported from production code (rather than a test helper) so jest.mock
 * can auto-resolve it alongside the other exports. Gated behind __DEV__
 * so the function is a no-op in production (bundler dead-code eliminates the branch).
 */
function resetForTesting() {
    if (!__DEV__) {
        return;
    }
    for (const channel of channels.values()) {
        clearChannelTimeout(channel);
    }
    channels.clear();
    flushedWatchKeys.clear();
    pendingRegistrations.clear();
}

export {
    registerDeferredWrite,
    reserveDeferredWriteChannel,
    flushDeferredWrite,
    cancelDeferredWrite,
    hasDeferredWrite,
    hasDeferredWriteForReport,
    getRegistrationPromiseForReport,
    getOptimisticWatchKey,
    deferOrExecuteWrite,
    resetForTesting,
};
