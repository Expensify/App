import Log from '@libs/Log';

import {useEffect, useEffectEvent, useRef} from 'react';

const DEFAULT_STALL_THRESHOLD_MS = 30_000;

/**
 * Logs an alert once via Log.alert if `isStalled` stays true for longer than thresholdMs.
 * For hangs that are defined by an update never arriving, nothing else throws or logs, so this
 * is the only signal that reaches the backend logs (and, via forwardLogsToSentry, Sentry).
 *
 * message/parameters are read through useEffectEvent so the timer is keyed only by isStalled and
 * thresholdMs. Callers that pass an inline object (e.g. `{reportID}`) get a new reference every
 * render, which would otherwise cancel and restart the timer on every unrelated re-render and
 * could keep it from ever firing.
 */
export default function useStallLogger(isStalled: boolean, message: string, parameters?: Record<string, unknown>, thresholdMs = DEFAULT_STALL_THRESHOLD_MS) {
    const hasLoggedRef = useRef(false);

    const logStall = useEffectEvent(() => {
        Log.alert(message, parameters, false);
    });

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
            logStall();
        }, thresholdMs);

        return () => clearTimeout(timeoutID);
    }, [isStalled, thresholdMs]);
}
