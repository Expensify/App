import {useEffect, useRef} from 'react';

/**
 * A hook that returns the previous value of a variable
 */
export default function usePrevious<T>(value: T): T {
    const ref = useRef<T>(value);
    useEffect(() => {
        ref.current = value;
    }, [value]);
    // eslint-disable-next-line react-compiler/react-compiler
    return ref.current;
}
