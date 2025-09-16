import {useRef} from 'react';
import type {ForwardedRef} from 'react';

function useRefWithFallback<RefType, ForwardedRefType = RefType>(ref: ForwardedRef<ForwardedRefType>) {
    const fallbackRef = useRef<RefType>(null);
    const combinedRef = (ref as React.RefObject<RefType>) ?? fallbackRef;

    return combinedRef;
}

export default useRefWithFallback;
