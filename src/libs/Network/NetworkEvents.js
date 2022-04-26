import createCallback from '../createCallback';

/**
 * This file helps bridge the Network layer with other parts of the app like API, NetworkConnection, PersistedRequestsQueue etc.
 * It helps avoid circular dependencies and by setting up event triggers and subscribers.
 */

const [getLogger, registerLogHandler] = createCallback();
const [triggerConnectivityResumed, onConnectivityResumed] = createCallback();

export {
    registerLogHandler,
    getLogger,
    triggerConnectivityResumed,
    onConnectivityResumed,
};
