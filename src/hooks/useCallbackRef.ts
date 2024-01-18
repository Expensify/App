import {useEffect, useMemo, useRef} from 'react';

const useCallbackRef = <T extends (...args: unknown[]) => unknown>(callback: T): T => {
    const calbackRef = useRef(callback);

    useEffect(() => {
        calbackRef.current = callback;
    });

    return useMemo(() => ((...args) => calbackRef.current(...args)) as T, []);
};

export default useCallbackRef;
