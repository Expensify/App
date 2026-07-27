import Log from './Log';

type SessionCleanupCallback = () => void;

const callbacks: SessionCleanupCallback[] = [];

/**
 * Registers a callback that releases module-level state holding the signed-in account's data
 * (e.g. memory caches keyed by Onyx collections). Registered callbacks run on sign-out via
 * `runSessionCleanupCallbacks` (called from `cleanupSession` in the Session actions).
 *
 * This module must not import the modules that own the caches: Session actions import it,
 * and such an import would create a cycle.
 */
function registerSessionCleanupCallback(callback: SessionCleanupCallback) {
    callbacks.push(callback);
}

/** Runs all registered cleanup callbacks. Called on sign-out. */
function runSessionCleanupCallbacks() {
    for (const callback of callbacks) {
        try {
            callback();
        } catch (error) {
            // A failing callback must not stop the rest — skipping a cleanup would leak the signed-out account's data into the next session.
            Log.warn('[SessionCleanup] A cleanup callback threw an error', {error});
        }
    }
}

export {registerSessionCleanupCallback, runSessionCleanupCallbacks};
