import CONST from '@src/CONST';
import type {OnyxData} from '@src/types/onyx/Request';

import type {OnyxKey} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';

import type {ReleaseReason, WriteReadyBarrier} from './API';
import type {ApiRequestCommandParameters, WriteCommand} from './API/types';

import {write, writeWhenReady} from './API';
import Log from './Log';
import {markPendingSubmitWriteForReport} from './pendingSubmitWrite';

/**
 * Coordinates deferred writeWhenReady() calls with screen content layout transitions.
 * Successor to deferredLayoutWrite.ts - same external shape and timing (reserve at dispatch time,
 * flush from the destination's layout/focus lifecycle), but write dispatch goes through
 * API.writeWhenReady instead of a bare setTimeout + callback.
 *
 * Note: The Search component has its own 10s safety timeout (clearOptimisticTracking) for the
 * UI-level optimistic item cache. The two timeouts serve different layers:
 *   - 5s (here): guarantees the API write executes.
 *   - 10s (Search): guarantees the skeleton/ghost-row UI clears if the optimistic
 *     item never reaches sortedData (e.g. empty list, API failure, offline).
 */
const DEFAULT_SAFETY_TIMEOUT_MS = 5000;

type SessionKey = ValueOf<typeof CONST.DEFERRED_LAYOUT_WRITE_KEYS>;

type Session = {
    /** Resolves this session's writeWhenReady barrier, releasing the pending write. No-op for a reserved session. */
    release: () => void;

    /**
     * An Onyx key that the pending write will create via optimistic data.
     * Consumer components can subscribe to this key with useOnyx to know
     * when the optimistic updates have been applied.
     */
    optimisticWatchKey?: OnyxKey;

    /**
     * Clears the report-side pending-write signal this session raised, when it targets a report.
     * Owned here for now so the signal's lifetime keeps matching the session's exactly; it moves to the
     * orchestrator once the dismiss-modal channel is gone and there is no session to tie it to.
     */
    clearPendingSignal?: () => void;

    /** True until a real write is scheduled onto this session. */
    isReserved: boolean;

    /** Set when flushWriteSession is called while the session is still reserved. */
    flushRequested: boolean;
};

const sessions = new Map<SessionKey, Session>();

// Watch keys that outlive their session. When a reserved session is flushed immediately
// (flushRequested path), the session is deleted but the watch key must remain accessible
// so Search's lazy getOptimisticWatchKey() resolution can still find it.
const flushedWatchKeys = new Map<SessionKey, OnyxKey>();

/**
 * Pre-create a session so that hasPendingWrite(key) returns true immediately.
 * The real write is scheduled later via scheduleWrite, which silently replaces the reservation.
 */
function reserveWriteSession(key: SessionKey, options: {destinationReportID?: string} = {}) {
    if (sessions.has(key)) {
        return;
    }
    flushedWatchKeys.delete(key);
    sessions.set(key, {
        release: () => {},
        isReserved: true,
        flushRequested: false,
        clearPendingSignal: markPendingSubmitWriteForReport(options.destinationReportID),
    });
}

function hasPendingWrite(key: SessionKey): boolean {
    return sessions.has(key);
}

/**
 * Returns the Onyx key that the pending write for the given session will create via optimistic
 * data. Returns undefined when no session exists or the session has no watch key.
 */
function getOptimisticWatchKey(key: SessionKey): OnyxKey | undefined {
    const sessionKey = sessions.get(key)?.optimisticWatchKey;
    if (sessionKey) {
        return sessionKey;
    }
    return flushedWatchKeys.get(key);
}

/**
 * Release the pending write for the given key. Called by the target component when actual
 * content (not skeleton) lays out.
 *
 * If the session is still reserved (real write not yet scheduled), the flush is deferred: the
 * session is marked flushRequested so that scheduleWrite executes the real write immediately
 * when it arrives, instead of scheduling a session that nobody would flush.
 */
function flushWriteSession(key: SessionKey) {
    const session = sessions.get(key);
    if (!session) {
        return;
    }
    if (session.isReserved) {
        session.flushRequested = true;
        return;
    }
    session.release();
}

/** Cancel a pending reservation without executing a write. No-op if no session is reserved for the key. */
function cancelWriteSession(key: SessionKey) {
    const session = sessions.get(key);
    if (session?.isReserved) {
        session.clearPendingSignal?.();
        sessions.delete(key);
    }
}

function registerOnSession<TCommand extends WriteCommand, TKey extends OnyxKey>(
    key: SessionKey,
    command: TCommand,
    params: ApiRequestCommandParameters[TCommand],
    onyxData: OnyxData<TKey>,
    optimisticWatchKey: OnyxKey | undefined,
    onWriteStarted: (() => void) | undefined,
) {
    const existing = sessions.get(key);
    // Carried over rather than cleared: the report-side signal has to stay raised across the
    // reserve -> real write handoff, and only drop when the write actually goes out.
    let clearPendingSignal: (() => void) | undefined;

    if (existing) {
        if (existing.isReserved) {
            clearPendingSignal = existing.clearPendingSignal;
            const shouldRunImmediately = existing.flushRequested;
            sessions.delete(key);

            if (shouldRunImmediately) {
                if (optimisticWatchKey) {
                    flushedWatchKeys.set(key, optimisticWatchKey);
                }
                clearPendingSignal?.();
                write(command, params, onyxData);
                onWriteStarted?.();
                return;
            }
        } else {
            Log.warn(`[submitWriteSession] Overwriting unflushed write for key "${key}" - flushing the pending one first`);
            existing.release();
        }
    }

    let release: () => void = () => {};
    const barrier: WriteReadyBarrier = () =>
        new Promise<void>((resolve) => {
            release = resolve;
        });

    const session: Session = {release: () => release(), optimisticWatchKey, clearPendingSignal, isReserved: false, flushRequested: false};
    sessions.set(key, session);

    writeWhenReady(command, params, onyxData, barrier, {
        safetyTimeoutMs: DEFAULT_SAFETY_TIMEOUT_MS,
        onRelease: (reason: ReleaseReason) => {
            // A later scheduleWrite call may have already superseded this session (flush-and-replace) -
            // only clean up if this release still owns the slot.
            if (sessions.get(key) !== session) {
                return;
            }
            sessions.delete(key);
            session.clearPendingSignal?.();
            if (session.optimisticWatchKey) {
                flushedWatchKeys.set(key, session.optimisticWatchKey);
            }
            if (reason !== 'success') {
                Log.warn(`[submitWriteSession] Write for key "${key}" released via "${reason}" - the safety timeout or app background fired first`);
            }
        },
        onWriteStarted,
    });
}

type ScheduleWriteOptions = {
    /**
     * The readiness barrier this write should wait on, handed down by whoever triggered the navigation.
     * When present it wins over every session branch below.
     *
     * It is passed in rather than looked up on purpose: the alternative is asking a module-level map
     * "is some channel reserved right now?", which is the hidden global state this migration removes -
     * stale state from an unrelated navigation could redirect an unrelated submission's scheduling.
     */
    barrier?: WriteReadyBarrier;

    shouldDeferForSearch: boolean;
    isRetry?: boolean;
    optimisticWatchKey?: OnyxKey;
    onDeferred?: () => void;
    onWriteStarted?: () => void;
};

/**
 * Decide whether to defer the API write behind a pending layout transition (Search pre-insert or
 * dismiss-modal) or execute it immediately, then dispatch through API.writeWhenReady/API.write.
 *
 * Priority order (first match wins):
 *   0. Caller-supplied barrier - no session involved, the caller owns the readiness signal
 *   1. SEARCH session       - checked via the caller-provided shouldDeferForSearch flag
 *   2. DISMISS_MODAL session - checked automatically via hasPendingWrite, skipped on retry
 *   3. SEARCH session (fallback) - checked automatically via hasPendingWrite, skipped on retry
 *   4. Immediate exec       - no active session, run now
 *
 * Branches 1-4 are the pre-migration behavior and are being removed call site by call site as each
 * one starts receiving a barrier instead.
 */
function scheduleWrite<TCommand extends WriteCommand, TKey extends OnyxKey>(
    command: TCommand,
    params: ApiRequestCommandParameters[TCommand],
    onyxData: OnyxData<TKey>,
    options: ScheduleWriteOptions,
) {
    const {barrier, shouldDeferForSearch, isRetry = false, optimisticWatchKey, onDeferred, onWriteStarted} = options;

    // A barrier means the write's readiness is already owned by the caller, so there is no session to
    // reserve, replace or flush, and no watch key to publish - watch keys exist only for Search's
    // placeholder UI, which resolves its writes through its own session rather than a passed barrier.
    if (barrier) {
        onDeferred?.();
        writeWhenReady(command, params, onyxData, barrier, {safetyTimeoutMs: DEFAULT_SAFETY_TIMEOUT_MS, onWriteStarted});
        return;
    }

    if (shouldDeferForSearch) {
        onDeferred?.();
        registerOnSession(CONST.DEFERRED_LAYOUT_WRITE_KEYS.SEARCH, command, params, onyxData, optimisticWatchKey, onWriteStarted);
        return;
    }

    // Retries skip deferral to avoid infinite loops (retry -> defer -> flush -> retry).
    if (!isRetry && hasPendingWrite(CONST.DEFERRED_LAYOUT_WRITE_KEYS.DISMISS_MODAL)) {
        onDeferred?.();
        registerOnSession(CONST.DEFERRED_LAYOUT_WRITE_KEYS.DISMISS_MODAL, command, params, onyxData, optimisticWatchKey, onWriteStarted);
        return;
    }

    // Fallback: a reserved SEARCH session (created before scheduleWrite) that wasn't matched by
    // the explicit shouldDeferForSearch flag.
    if (!isRetry && hasPendingWrite(CONST.DEFERRED_LAYOUT_WRITE_KEYS.SEARCH)) {
        onDeferred?.();
        registerOnSession(CONST.DEFERRED_LAYOUT_WRITE_KEYS.SEARCH, command, params, onyxData, optimisticWatchKey, onWriteStarted);
        return;
    }

    write(command, params, onyxData);
    onWriteStarted?.();
}

/**
 * Clear all sessions and flushed watch keys. Only for use in tests. Exported from production code
 * (rather than a test helper) so jest.mock can auto-resolve it alongside the other exports. Gated
 * behind __DEV__ so the function is a no-op in production (bundler dead-code eliminates the branch).
 */
function resetForTesting() {
    if (!__DEV__) {
        return;
    }
    sessions.clear();
    flushedWatchKeys.clear();
}

export {
    reserveWriteSession,
    flushWriteSession,
    cancelWriteSession,
    hasPendingWrite,
    getOptimisticWatchKey,
    scheduleWrite,
    resetForTesting,
    // Exported so the unit test asserts against the real value rather than a copy of it.
    DEFAULT_SAFETY_TIMEOUT_MS,
};
export type {ScheduleWriteOptions};
