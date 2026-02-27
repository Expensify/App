/**
 * Observer pattern implementation for multifactor authentication callbacks.
 */
import {MultifactorAuthenticationCallbacks} from './VALUES';

/**
 * Manages registration and storage of multifactor authentication callback functions.
 * Used for subscribing to authentication flow events.
 */
const MultifactorAuthenticationObserver = {
    /**
     * Registers a callback function for a specific event ID.
     */
    registerCallback: (id: string, callback: () => unknown) => {
        MultifactorAuthenticationCallbacks.onFulfill[id] = callback;
    },
    unregisterCallback: (id: string) => {
        delete MultifactorAuthenticationCallbacks.onFulfill[id];
    },
    clearAllCallbacks: () => {
        MultifactorAuthenticationCallbacks.onFulfill = {};
    },
};

export default MultifactorAuthenticationObserver;
