import {useCallback, useEffect, useRef} from 'react';
import type UseHandleBrowserBackCallback from './types';

export default function useHandleBrowserBack(callback: UseHandleBrowserBackCallback, isActive: boolean) {
    const callbackRef = useRef(callback);
    const hasPushedRef = useRef(false);

    useEffect(() => {
        callbackRef.current = callback;
    }, [callback]);

    const handlePopState = useCallback(() => {
        // Browser back was pressed - our entry is consumed
        hasPushedRef.current = false;
        callbackRef.current();
    }, []);

    useEffect(() => {
        if (!isActive) {
            // If we pushed an entry and it wasn't consumed by popstate (UI back was used),
            // we need to remove the extra history entry
            if (hasPushedRef.current) {
                hasPushedRef.current = false;
                window.history.back();
            }
            return;
        }

        window.history.pushState({isNotFoundPage: true}, '', null);
        hasPushedRef.current = true;
        window.addEventListener('popstate', handlePopState);

        return () => {
            window.removeEventListener('popstate', handlePopState);
        };
    }, [isActive, handlePopState]);
}
