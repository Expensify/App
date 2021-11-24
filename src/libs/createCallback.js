import _ from 'underscore';

/**
 * Utility for registering a single callback. Use to inject dependencies in places where you would normally "register" a method
 * that you want to call later. Can be overwritten or cleared and returns value to caller. This is intented to be used with array
 * destructuring.
 *
 * @example
 *
 * const [onResponse, handleResponse, clearHandler] = createCallback();
 *
 * @returns {Array}
 */
function createCallback() {
    let callback = null;

    function clear() {
        callback = null;
    }

    function set(newCallback) {
        callback = newCallback;
    }

    function run(...args) {
        if (!_.isFunction(callback)) {
            return;
        }

        return callback(...args);
    }

    return [run, set, clear];
}

export default createCallback;
