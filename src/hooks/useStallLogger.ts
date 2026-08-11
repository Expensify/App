import Log from '@libs/Log';

import {useEffect, useRef} from 'react';

const DEFAULT_STALL_THRESHOLD_MS = 30_000;

/**
 * Logs an alert once via Log.alert if `isStalled` stays true for longer than thresholdMs.
 * For hangs that are defined by an update never arriving, nothing else throws or logs, so this
 * is the only signal that reaches the backend logs (and, via forwardLogsToSentry, Sentry).
 */
export default function useStallLogger(isStalled: boolean, message: string, parameters?: Record<string, unknown>, thresholdMs = DEFAULT_STALL_THRESHOLD_MS) {
    const hasLoggedRef = useRef(false);

    useEffect(() => {
        if (!isStalled) {
            hasLoggedRef.current = false;
            return;
        }
        if (hasLoggedRef.current) {
            return;
        }

        const timeoutID = setTimeout(() => {
            hasLoggedRef.current = true;
            Log.alert(message, parameters, false);
        }, thresholdMs);

        return () => clearTimeout(timeoutID);
    }, [isStalled, message, parameters, thresholdMs]);
}
