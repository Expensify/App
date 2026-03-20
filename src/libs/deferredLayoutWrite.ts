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
 * A per-channel safety timeout ensures the write always fires even if the target
 * screen never mounts or the user navigates elsewhere.
 */
import Log from './Log';

const DEFAULT_SAFETY_TIMEOUT_MS = 5000;

type DeferredChannel = {
    write: () => void;
    safetyTimeoutId: ReturnType<typeof setTimeout>;
};

const channels = new Map<string, DeferredChannel>();

function clearChannelTimeout(channel: DeferredChannel) {
    clearTimeout(channel.safetyTimeoutId);
}

/**
 * Register a callback to be executed when the target component lays out.
 * If a previous write for the same key is still pending it is flushed
 * immediately before registering the new one.
 */
function registerDeferredWrite(key: string, callback: () => void, safetyTimeoutMs: number = DEFAULT_SAFETY_TIMEOUT_MS) {
    const existing = channels.get(key);
    if (existing) {
        Log.warn(`[DeferredLayoutWrite] Overwriting unflushed deferred write for key "${key}" - flushing the pending one first`);
        flushDeferredWrite(key);
    }

    const safetyTimeoutId = setTimeout(() => {
        Log.warn(`[DeferredLayoutWrite] Safety timeout (${safetyTimeoutMs}ms) fired for key "${key}" - the target component likely never laid out`);
        flushDeferredWrite(key);
    }, safetyTimeoutMs);

    channels.set(key, {write: callback, safetyTimeoutId});
}

/**
 * Execute and clear the pending deferred write for the given key.
 * Called by the target component when actual content (not skeleton) lays out.
 */
function flushDeferredWrite(key: string) {
    const channel = channels.get(key);
    if (!channel) {
        return;
    }

    clearChannelTimeout(channel);
    channels.delete(key);
    channel.write();
}

function hasDeferredWrite(key: string): boolean {
    return channels.has(key);
}

export {registerDeferredWrite, flushDeferredWrite, hasDeferredWrite};
