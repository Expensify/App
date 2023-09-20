import {useEffect, useRef} from 'react';
import lodashDebounce from 'lodash/debounce';

/**
 * Create and return a debounced function.
 * 
 * Make sure to pass a stable function reference to prevent recreating the debounced function on each render.
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

    useEffect(() => {
        const debouncedFn = lodashDebounce(func, wait, options);

        debouncedFnRef.current = debouncedFn;

        return debouncedFn.cancel;
    }, [func, wait, options]);

    return (...args) => {
        const debouncedFn = debouncedFnRef.current;

        if (debouncedFn) {
            debouncedFn(...args);
        }
    };
}
