import {useEffect, useRef, useState} from 'react';
import type {RefObject} from 'react';

function useRefMirror<T>(value: T): RefObject<T> {
    const ref = useRef(value);
    useEffect(() => {
        ref.current = value;
    });
    return ref;
}

function useCallbackRef<Args extends readonly unknown[], R>(callback: (...args: Args) => R): (...args: Args) => R {
    const ref = useRefMirror(callback);
    const [stable] = useState(
        () =>
            (...args: Args) =>
                ref.current(...args),
    );
    return stable;
}

export {useRefMirror};
export default useCallbackRef;
