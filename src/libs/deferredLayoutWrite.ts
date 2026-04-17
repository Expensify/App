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
import type {OnyxKey} from 'react-native-onyx';
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
};

/**
 * Register a callback to be executed when the target component lays out.
 * If a previous write for the same key is still pending it is flushed
 * immediately before registering the new one.
 */
function registerDeferredWrite(key: string, callback: () => void, options: DeferredWriteOptions = {}) {
    const {safetyTimeoutMs = DEFAULT_SAFETY_TIMEOUT_MS, optimisticWatchKey} = options;

    const existing = channels.get(key);
    if (existing) {
        if (existing.isReserved) {
            clearChannelTimeout(existing);
            const shouldFlushImmediately = existing.flushRequested;
            channels.delete(key);

            if (shouldFlushImmediately) {
                if (optimisticWatchKey) {
                    flushedWatchKeys.set(key, optimisticWatchKey);
                }
                callback();
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

    channels.set(key, {write: callback, safetyTimeoutId, optimisticWatchKey});
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
 */
function reserveDeferredWriteChannel(key: string) {
    if (channels.has(key)) {
        return;
    }

    flushedWatchKeys.delete(key);

    const safetyTimeoutId = setTimeout(() => {
        Log.warn(`[DeferredLayoutWrite] Safety timeout fired for reserved channel "${key}" - the real write was never registered`);
        channels.delete(key);
    }, DEFAULT_SAFETY_TIMEOUT_MS);

    channels.set(key, {write: () => {}, safetyTimeoutId, isReserved: true});
}

function hasDeferredWrite(key: string): boolean {
    return channels.has(key);
}

/**
 * Returns the Onyx key that the deferred write for the given channel will
 * create via optimistic data. Returns undefined when no channel is registered
 * or the channel was registered without a watch key.
 */
function getOptimisticWatchKey(key: string): OnyxKey | undefined {
    return channels.get(key)?.optimisticWatchKey ?? flushedWatchKeys.get(key);
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

export {registerDeferredWrite, reserveDeferredWriteChannel, flushDeferredWrite, cancelDeferredWrite, hasDeferredWrite, getOptimisticWatchKey};
