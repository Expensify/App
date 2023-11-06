import lodashDebounce from 'lodash/debounce';
import {useCallback, useEffect, useRef} from 'react';

/**
 * Create and return a debounced function.
 *
 * Every time the identity of any of the arguments changes, the debounce operation will restart (canceling any ongoing debounce).
 * This is especially important in the case of func. To prevent that, pass stable references.
 *
 * @param {Function} func The function to debounce.
 * @param {Number} wait The number of milliseconds to delay.
 * @param {Object} options The options object.
 * @param {Boolean} options.leading Specify invoking on the leading edge of the timeout.
 * @param {Number} options.maxWait The maximum time func is allowed to be delayed before it’s invoked.
 * @param {Boolean} options.trailing Specify invoking on the trailing edge of the timeout.
 * @returns {Function} Returns a function to call the debounced function.
 */
export default function useDebounce(func, wait, options) {
    const debouncedFnRef = useRef();
    const {leading, maxWait, trailing = true} = options || {};

    useEffect(() => {
        const debouncedFn = lodashDebounce(func, wait, {leading, maxWait, trailing});

        debouncedFnRef.current = debouncedFn;

        return debouncedFn.cancel;
    }, [func, wait, leading, maxWait, trailing]);

    const debounceCallback = useCallback((...args) => {
        const debouncedFn = debouncedFnRef.current;

        if (debouncedFn) {
            debouncedFn(...args);
        }
    }, []);

    return debounceCallback;
}
