import {useIsFocused} from '@react-navigation/native';
import {useEffect, useEffectEvent, useRef, useState} from 'react';

import useAppReturnCount from './useAppReturnCount';
import useIsTabFocused from './useIsTabFocused';

/** A return to the app this soon after the last refresh is skipped, so flicking between browser tabs costs nothing. */
const APP_RETURN_REFRESH_INTERVAL_MS = 60 * 1000;

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
    const lastAppReturnCountRef = useRef(appReturnCount);
    const lastRefreshTimeRef = useRef(0);
    const isRefreshPendingRef = useRef(false);
    // A skipped return is replayed once the window ends, so an expense made while away still shows up.
    const deferredReturnTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
    const [deferredReturnCount, setDeferredReturnCount] = useState(0);
    const lastDeferredReturnCountRef = useRef(deferredReturnCount);

    useEffect(() => () => clearTimeout(deferredReturnTimerRef.current), []);

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
        if (deferredReturnCount !== lastDeferredReturnCountRef.current) {
            lastDeferredReturnCountRef.current = deferredReturnCount;
            isRefreshPendingRef.current = true;
        }
        if (appReturnCount !== lastAppReturnCountRef.current) {
            lastAppReturnCountRef.current = appReturnCount;
            const elapsed = Date.now() - lastRefreshTimeRef.current;
            // A negative gap means the device clock moved back, so the window is treated as over.
            if (elapsed < 0 || elapsed >= APP_RETURN_REFRESH_INTERVAL_MS) {
                isRefreshPendingRef.current = true;
            } else if (!deferredReturnTimerRef.current) {
                deferredReturnTimerRef.current = setTimeout(() => {
                    deferredReturnTimerRef.current = undefined;
                    setDeferredReturnCount((count) => count + 1);
                }, APP_RETURN_REFRESH_INTERVAL_MS - elapsed);
            }
        }

        if (!isTabFocused || !isScreenVisible || !isRefreshPendingRef.current) {
            return;
        }

        isRefreshPendingRef.current = false;
        lastRefreshTimeRef.current = Date.now();
        clearTimeout(deferredReturnTimerRef.current);
        deferredReturnTimerRef.current = undefined;
        onRefresh();
    }, [isTabFocused, isScreenVisible, refreshKey, appReturnCount, deferredReturnCount]);
}

export default useTabFocusedRefresh;
