import {useEffect, useRef} from 'react';
import lodashDebounce from 'lodash/debounce';

/**
 * @param {*} func Function to debounce `waitMS` ms.
 * @param {*} wait The number of milliseconds to wait before `func` can be invoked again.
 * @param {*} immediate True if `func` should be invoked on the leading edge of `waitMS` instead of the trailing edge.
 * @returns 
 */
export default function useDebounce(func, wait, immediate) {
    const debouncedFnRef = useRef();

    useEffect(() => {
        const debouncedFn = lodashDebounce(func, wait, immediate);

        debouncedFnRef.current = debouncedFn;

        return debouncedFn.cancel;
    }, [func, wait, immediate]);

    return debouncedFnRef.current;
}
