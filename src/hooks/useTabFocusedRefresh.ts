import Visibility from '@libs/Visibility';

import {useIsFocused} from '@react-navigation/native';
import {useEffect, useEffectEvent, useRef, useState} from 'react';

import useIsTabFocused from './useIsTabFocused';

/**
 * Calls `refresh` when the tab becomes active, when `refreshKey` changes, and when the app becomes
 * visible again, but never while an RHP covers the screen: a change landing behind an RHP is held
 * and flushed once the screen is visible again. Closing an RHP on its own refreshes nothing.
 */
function useTabFocusedRefresh(tabName: string, refreshKey: string, refresh: () => void): void {
    const isTabFocused = useIsTabFocused(tabName);
    const isScreenVisible = useIsFocused();
    const onRefresh = useEffectEvent(refresh);

    // Some values, like currency conversion, have nothing local to watch and only move while the user
    // is away, so a return to the app is worth one re-read.
    const [appReturnCount, setAppReturnCount] = useState(0);

    const wasTabFocusedRef = useRef(false);
    const lastRefreshKeyRef = useRef<string | undefined>(undefined);
    const isRefreshPendingRef = useRef(false);

    useEffect(() => {
        return Visibility.onVisibilityChange(() => {
            if (!Visibility.isVisible()) {
                return;
            }
            setAppReturnCount((count) => count + 1);
        });
    }, []);

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
