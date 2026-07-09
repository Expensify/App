type SessionCleanupCallback = () => void;

const callbacks: SessionCleanupCallback[] = [];

/**
 * Registers a callback that releases module-level state holding the signed-in account's data
 * (e.g. memory caches keyed by Onyx collections). Registered callbacks run on sign-out via
 * `runSessionCleanupCallbacks` (called from `cleanupSession` in the Session actions).
 *
 * This module is dependency-free on purpose: Session actions can import it without pulling in
 * (and creating import cycles with) the modules that own the caches.
 */
function registerSessionCleanupCallback(callback: SessionCleanupCallback) {
    callbacks.push(callback);
}

/** Runs all registered cleanup callbacks. Called on sign-out. */
function runSessionCleanupCallbacks() {
    for (const callback of callbacks) {
        callback();
    }
}

export {registerSessionCleanupCallback, runSessionCleanupCallbacks};
