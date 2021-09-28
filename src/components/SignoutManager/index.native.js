let signoutCallback = () => {};

/**
 * @param {Function} callback
 */
function registerSignoutCallback(callback) {
    signoutCallback = callback;
}

/**
 * @param {String} errorMessage
 */
function signOut(errorMessage) {
    signoutCallback(errorMessage);
}

export default {
    signOut,
    registerSignoutCallback,
};
