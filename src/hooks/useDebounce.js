import {useEffect, useRef} from 'react';
import lodashDebounce from 'lodash/debounce';

/**
 * @param {Function} func The function to debounce.
 * @param {Number} wait The number of milliseconds to delay.
 * @param {Object} options The options object.
 * @param {Boolean} options.leading Specify invoking on the leading edge of the timeout.
 * @param {Number} options.maxWait The maximum time func is allowed to be delayed before it’s invoked.
 * @param {Boolean} options.trailing Specify invoking on the trailing edge of the timeout.
 * @returns Returns the new debounced function.
 */
export default function useDebounce(func, wait, options) {
    const debouncedFnRef = useRef();

    useEffect(() => {
        const debouncedFn = lodashDebounce(func, wait, options);

        debouncedFnRef.current = debouncedFn;

        return debouncedFn.cancel;
    }, [func, wait, options]);

    return debouncedFnRef.current;
}
