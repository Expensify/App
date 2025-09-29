import {useRef} from 'react';

function useRefWithFallback<RefType, InputRefType = RefType>(ref: InputRefType | undefined) {
    const fallbackRef = useRef<RefType>(null);
    const combinedRef = (ref as React.RefObject<RefType>) ?? fallbackRef;

    return combinedRef;
}

export default useRefWithFallback;
