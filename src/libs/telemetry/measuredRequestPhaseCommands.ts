import {READ_COMMANDS} from '@libs/API/types';
import isStartupNetworkRequest from '@libs/AppStartupNetworkRequest';

import CONST from '@src/CONST';

/**
 * Separate names per command so a new one doesn't dilute an existing metric's history in Sentry.
 * Keep this list short: every command here emits several spans per request.
 */
function getRequestPhaseSpanNames(command?: string) {
    if (isStartupNetworkRequest(command)) {
        return CONST.TELEMETRY.SPAN_STARTUP_DATA;
    }
    if (command === READ_COMMANDS.SEARCH) {
        return CONST.TELEMETRY.SPAN_SEARCH_DATA;
    }
    return undefined;
}

const attemptsBySpanName = new Map<string, number>();

/** Counted per span name rather than globally, so a concurrent Search never shifts the attempt numbers a startup span reports. */
function getNextRequestPhaseAttempt(spanName: string) {
    const attempt = (attemptsBySpanName.get(spanName) ?? 0) + 1;
    attemptsBySpanName.set(spanName, attempt);
    return attempt;
}

export default getRequestPhaseSpanNames;
export {getNextRequestPhaseAttempt};
