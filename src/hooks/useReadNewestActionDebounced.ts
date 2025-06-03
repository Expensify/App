import {useCallback, useRef} from 'react';
import {readNewestAction} from '@userActions/Report';

const DEBOUNCE_MS = 300;
const THROTTLE_MS = 1000;

/**
 * Hook to prevent duplicate readNewestAction calls at the component level
 * Uses both debouncing and throttling to ensure optimal API usage
 */
export default function useReadNewestActionDebounced() {
    const debounceTimerRef = useRef<NodeJS.Timeout>();
    const lastCallTimeRef = useRef<Record<string, number>>({});
    const pendingCallsRef = useRef<Record<string, boolean>>({});

    const debouncedReadNewestAction = useCallback(
        (reportID: string | undefined, shouldResetUnreadMarker = false) => {
            if (!reportID) {
                return;
            }

            const now = Date.now();
            const lastCallTime = lastCallTimeRef.current[reportID] || 0;
            const timeSinceLastCall = now - lastCallTime;

            // Clear existing debounce timer for this report
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }

            // If we're within throttle window and already have a pending call, skip
            if (timeSinceLastCall < THROTTLE_MS && pendingCallsRef.current[reportID]) {
                return;
            }

            // If we're within throttle window but no pending call, execute immediately
            if (timeSinceLastCall < THROTTLE_MS) {
                lastCallTimeRef.current[reportID] = now;
                pendingCallsRef.current[reportID] = true;
                
                readNewestAction(reportID, shouldResetUnreadMarker);
                
                // Clear pending flag after a short delay
                setTimeout(() => {
                    pendingCallsRef.current[reportID] = false;
                }, 100);
                return;
            }

            // Otherwise, debounce the call
            pendingCallsRef.current[reportID] = true;
            debounceTimerRef.current = setTimeout(() => {
                lastCallTimeRef.current[reportID] = Date.now();
                readNewestAction(reportID, shouldResetUnreadMarker);
                pendingCallsRef.current[reportID] = false;
            }, DEBOUNCE_MS);
        },
        [],
    );

    return debouncedReadNewestAction;
}
