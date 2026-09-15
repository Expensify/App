import {useIsFocused} from '@react-navigation/native';
import {useEffect, useEffectEvent, useRef} from 'react';

import useIsTabFocused from './useIsTabFocused';

/**
 * Calls `refresh` when the tab becomes active and when `refreshKey` changes, but never while an RHP
 * covers the screen: a change landing behind an RHP is held and flushed once the screen is visible
 * again. Closing an RHP on its own therefore refreshes nothing.
 */
function useTabFocusedRefresh(tabName: string, refreshKey: string, refresh: () => void): void {
    const isTabFocused = useIsTabFocused(tabName);
    const isScreenVisible = useIsFocused();
    const onRefresh = useEffectEvent(refresh);

    const wasTabFocusedRef = useRef(false);
    const lastRefreshKeyRef = useRef<string | undefined>(undefined);
    const isRefreshPendingRef = useRef(false);

    useEffect(() => {
        const wasTabFocused = wasTabFocusedRef.current;
        wasTabFocusedRef.current = isTabFocused;

        if (isTabFocused && !wasTabFocused) {
            isRefreshPendingRef.current = true;
        }
        if (refreshKey !== lastRefreshKeyRef.current) {
            lastRefreshKeyRef.current = refreshKey;
            isRefreshPendingRef.current = true;
        }

        if (!isTabFocused || !isScreenVisible || !isRefreshPendingRef.current) {
            return;
        }

        isRefreshPendingRef.current = false;
        onRefresh();
    }, [isTabFocused, isScreenVisible, refreshKey]);
}

export default useTabFocusedRefresh;
