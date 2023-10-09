import {useEffect, useRef} from 'react';

/**
 * A hook that returns the previous value of a variable
 *
 * @param {*} value
 * @returns {*}
 */
export default function usePrevious(value) {
    const ref = useRef(value);
    useEffect(() => {
        ref.current = value;
    }, [value]);
    return ref.current;
}
