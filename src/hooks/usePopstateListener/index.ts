import {useEffect, useRef} from 'react';

/** Web: runs the callback on browser back/forward (popstate). In-app navigation never fires it. */
export default function usePopstateListener(isActive: boolean, onPopstate: () => void) {
    const onPopstateRef = useRef(onPopstate);

    useEffect(() => {
        onPopstateRef.current = onPopstate;
    });

    useEffect(() => {
        if (!isActive) {
            return;
        }
        const handler = () => onPopstateRef.current();
        window.addEventListener('popstate', handler);
        return () => window.removeEventListener('popstate', handler);
    }, [isActive]);
}
