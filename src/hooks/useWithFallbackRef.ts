import {useRef} from 'react';
import type {ForwardedRef} from 'react';

function useWithFallbackRef<RefType, ForwaredRefType = RefType>(ref: ForwardedRef<ForwaredRefType>) {
    const fallbackRef = useRef<RefType>(null);
    const combinedRef = (ref as React.RefObject<RefType>) ?? fallbackRef;

    return combinedRef;
}

export default useWithFallbackRef;
