/**
 * This is a minimal shim for NetInfo on Electron / desktop. It's necessary since the NetworkInformation API exists,
 * but does not work as expected in Electron environments since the navigator.connection.type returns "unknown".
 *
 * See: https://github.com/react-native-netinfo/react-native-netinfo/issues/450
 */

let callback;
const connection = window.navigator.connection;

/**
 * Calls the callback with the status
 */
function onStatusChange() {
    callback({isConnected: window.navigator.onLine});
}

/**
 * Unsubscribe events
 */
function unsubscribe() {
    if (connection) {
        connection.removeEventListener('change', onStatusChange);
    } else {
        window.removeEventListener('online', onStatusChange);
        window.removeEventListener('offline', onStatusChange);
    }
}

/**
 * @param {Function} cb
 * @return {Function} method to unsubscribe
 */
function addEventListener(cb) {
    callback = cb;

    if (connection) {
        connection.addEventListener('change', onStatusChange);
    } else {
        window.addEventListener('online', onStatusChange);
        window.addEventListener('offline', onStatusChange);
    }

    // We initialize the status once when first subscribing
    onStatusChange();
    return unsubscribe;
}

export default {
    addEventListener,
};
