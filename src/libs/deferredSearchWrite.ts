/**
 * Coordinates deferred API.write() calls with the Search screen's content layout.
 *
 * Problem: API.write() applies optimistic Onyx data synchronously, which triggers
 * expensive collection-level re-renders. When navigating to Search after expense
 * creation, firing this during the skeleton→content transition blocks the JS thread
 * and makes the skeleton hang.
 *
 * Solution: The IOU action registers its write here; the Search component flushes it
 * from its content onLayout callback (not the skeleton's). A safety timeout ensures
 * the write always fires even if navigation goes elsewhere.
 */

// Generous upper bound to guarantee the write fires even if the user navigates
// away from Search or the screen never mounts.
const SAFETY_TIMEOUT_MS = 5000;

let deferredWrite: (() => void) | undefined;
let safetyTimeoutId: ReturnType<typeof setTimeout> | undefined;

function clearSafetyTimeout() {
    if (safetyTimeoutId === undefined) {
        return;
    }
    clearTimeout(safetyTimeoutId);
    safetyTimeoutId = undefined;
}

/**
 * Register a callback to be executed when the Search content lays out.
 * If a previous write is still pending it is flushed immediately before registering the new one.
 */
function registerDeferredSearchWrite(callback: () => void) {
    if (deferredWrite) {
        flushDeferredSearchWrite();
    }

    deferredWrite = callback;
    clearSafetyTimeout();
    safetyTimeoutId = setTimeout(flushDeferredSearchWrite, SAFETY_TIMEOUT_MS);
}

/**
 * Execute and clear the pending deferred write, if any.
 * Called by the Search component when actual content (not skeleton) lays out.
 */
function flushDeferredSearchWrite() {
    clearSafetyTimeout();
    const write = deferredWrite;
    deferredWrite = undefined;
    write?.();
}

function hasDeferredSearchWrite(): boolean {
    return deferredWrite !== undefined;
}

export {registerDeferredSearchWrite, flushDeferredSearchWrite, hasDeferredSearchWrite};
