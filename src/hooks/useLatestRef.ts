import type {RefObject} from 'react';

import {useLayoutEffect, useRef} from 'react';

/**
 * A ref that always holds the value of the latest committed render. Read it from callbacks that must keep a stable
 * identity (for example actions handed to memoized list rows) while still acting on current props and state.
 */
function useLatestRef<T>(value: T): RefObject<T> {
    const ref = useRef<T>(value);
    useLayoutEffect(() => {
        ref.current = value;
    });
    return ref;
}

export default useLatestRef;
