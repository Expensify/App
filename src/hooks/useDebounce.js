import {useEffect, useRef} from 'react';
import _ from 'underscore';

export default function useDebounce(func, wait, immediate) {
    const debouncedFnRef = useRef();

    useEffect(() => {
        const debouncedFn = _.debounce(func, wait, immediate);

        debouncedFnRef.current = debouncedFn;

        return debouncedFn.cancel;
    }, [func, wait, immediate]);

    return debouncedFnRef.current;
}
