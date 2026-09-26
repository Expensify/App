import {useIsFocused} from '@react-navigation/native';
import {useEffect, useEffectEvent, useRef} from 'react';

import useAppReturnCount from './useAppReturnCount';
import useIsTabFocused from './useIsTabFocused';

/**
 * Calls `refresh` when the tab becomes active, when `refreshKey` changes, and when the app becomes
 * visible again. A change landing behind an RHP waits until the screen is visible, so closing an RHP
 * refreshes nothing on its own.
 */
function useTabFocusedRefresh(tabName: string, refreshKey: string, refresh: () => void): void {
    const isTabFocused = useIsTabFocused(tabName);
    const isScreenVisible = useIsFocused();
    const onRefresh = useEffectEvent(refresh);

    // Currency conversion and the like have nothing local to watch, so a return to the app re-reads them.
    const appReturnCount = useAppReturnCount();

    const wasTabFocusedRef = useRef(false);
    const lastRefreshKeyRef = useRef<string | undefined>(undefined);
    const isRefreshPendingRef = useRef(false);

    useEffect(() => {
        const wasTabFocused = wasTabFocusedRef.current;
        wasTabFocusedRef.current = isTabFocused;
        const currentKey = `${refreshKey}|${appReturnCount}`;

        if (isTabFocused && !wasTabFocused) {
            isRefreshPendingRef.current = true;
        }
        if (currentKey !== lastRefreshKeyRef.current) {
            lastRefreshKeyRef.current = currentKey;
            isRefreshPendingRef.current = true;
        }

        if (!isTabFocused || !isScreenVisible || !isRefreshPendingRef.current) {
            return;
        }

        isRefreshPendingRef.current = false;
        onRefresh();
    }, [isTabFocused, isScreenVisible, refreshKey, appReturnCount]);
}

export default useTabFocusedRefresh;
