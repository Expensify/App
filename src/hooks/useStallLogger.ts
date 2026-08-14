import Log from '@libs/Log';

import {useEffect, useEffectEvent} from 'react';

const DEFAULT_STALL_THRESHOLD_MS = 30_000;

/**
 * Logs an alert once via Log.alert if `stallKey` stays the same truthy value for longer than
 * thresholdMs. For hangs that are defined by an update never arriving, nothing else throws or
 * logs, so this is the only signal that reaches the backend logs (and, via forwardLogsToSentry,
 * Sentry).
 *
 * `stallKey` should identify *what* is stalling (e.g. a reportID), not just *whether* something
 * is stalling: a plain boolean can't tell "still waiting on report A" apart from "now waiting on
 * report B", so switching what's being waited on (e.g. the report screen re-parameterized to a
 * different reportID without remounting) would otherwise keep the original timer running and log
 * it against the wrong key once it fires. Pass `false`/`undefined` when nothing is stalled.
 *
 * message/parameters are read through useEffectEvent so the timer isn't restarted by an inline
 * object literal (e.g. `{reportID}`) getting a new reference on every unrelated re-render.
 */
export default function useStallLogger(stallKey: string | number | false | undefined, message: string, parameters?: Record<string, unknown>, thresholdMs = DEFAULT_STALL_THRESHOLD_MS) {
    const logStall = useEffectEvent(() => {
        Log.alert(message, parameters, false);
    });

    useEffect(() => {
        if (!stallKey) {
            return;
        }

        const timeoutID = setTimeout(logStall, thresholdMs);

        return () => clearTimeout(timeoutID);
    }, [stallKey, thresholdMs]);
}
