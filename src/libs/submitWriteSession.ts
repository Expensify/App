import CONST from '@src/CONST';
import type {OnyxData} from '@src/types/onyx/Request';

import type {OnyxKey} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';

import type {ReleaseReason, WriteReadyBarrier} from './API';
import type {ApiRequestCommandParameters, WriteCommand} from './API/types';

import {write, writeWhenReady} from './API';
import Log from './Log';

/**
 * Coordinates deferred writeWhenReady() calls with Search's content layout.
 *
 * Transitional: this is the last of the shared write-timing registry, kept only because Search still
 * releases its writes from its own layout/focus lifecycle. Dismiss-modal destinations no longer use it
 * - they hand the write a pre-armed transition barrier instead (see API.armTransitionBarrier).
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
function reserveWriteSession(key: SessionKey) {
    if (sessions.has(key)) {
        return;
    }
    flushedWatchKeys.delete(key);
    sessions.set(key, {release: () => {}, isReserved: true, flushRequested: false});
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

    if (existing) {
        if (existing.isReserved) {
            const shouldRunImmediately = existing.flushRequested;
            sessions.delete(key);

            if (shouldRunImmediately) {
                if (optimisticWatchKey) {
                    flushedWatchKeys.set(key, optimisticWatchKey);
                }
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

    const session: Session = {release: () => release(), optimisticWatchKey, isReserved: false, flushRequested: false};
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
 * Decide whether to defer the API write behind Search's pending layout transition or execute it
 * immediately, then dispatch through API.writeWhenReady/API.write.
 *
 * Priority order (first match wins):
 *   0. Caller-supplied barrier - no session involved, the caller owns the readiness signal
 *   1. SEARCH session - via the caller-provided shouldDeferForSearch flag
 *   2. SEARCH session (fallback) - a reservation made before this call, skipped on retry
 *   3. Immediate exec - nothing pending, run now
 *
 * Branches 1-3 are the pre-migration behavior. Only Search still relies on them; once it owns its own
 * barrier this whole module goes away and each action calls API.writeWhenReady directly.
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
        if (__DEV__ && optimisticWatchKey) {
            // Search is the only consumer of watch keys and has not moved to barriers yet. When it does,
            // the barrier path needs its own way to publish this key - dropping it silently would break
            // Search's placeholder tracking with no registry left to fall back on.
            Log.warn('[submitWriteSession] optimisticWatchKey was passed alongside a barrier and is being ignored', {command, optimisticWatchKey});
        }
        onDeferred?.();
        writeWhenReady(command, params, onyxData, barrier, {safetyTimeoutMs: DEFAULT_SAFETY_TIMEOUT_MS, onWriteStarted});
        return;
    }

    if (shouldDeferForSearch) {
        onDeferred?.();
        registerOnSession(CONST.DEFERRED_LAYOUT_WRITE_KEYS.SEARCH, command, params, onyxData, optimisticWatchKey, onWriteStarted);
        return;
    }

    // Fallback: a reserved SEARCH session (created before scheduleWrite) that wasn't matched by
    // the explicit shouldDeferForSearch flag. Retries skip it to avoid an infinite
    // retry -> defer -> flush -> retry loop.
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
