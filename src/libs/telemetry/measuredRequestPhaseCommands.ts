import {READ_COMMANDS} from '@libs/API/types';
import APP_STARTUP_NETWORK_REQUEST from '@libs/AppStartupNetworkRequest';

import CONST from '@src/CONST';

/**
 * Commands whose request is broken down into phase spans (server wait, download, Onyx apply).
 * The instrumentation itself is command-agnostic; only the span names differ per command.
 * Keep this set small: every command here emits several spans per request.
 */
const MEASURED_REQUEST_PHASE_COMMANDS = new Set<string>([...APP_STARTUP_NETWORK_REQUEST, READ_COMMANDS.SEARCH]);

/** Each command reports into its own span names, so a new measured command never dilutes an existing metric's history in Sentry. */
function getRequestPhaseSpanNames(command: string) {
    return APP_STARTUP_NETWORK_REQUEST.has(command) ? CONST.TELEMETRY.SPAN_STARTUP_DATA : CONST.TELEMETRY.SPAN_SEARCH_DATA;
}

const attemptsBySpanName = new Map<string, number>();

/**
 * Reauthentication (407) and throttle backoff both re-send the same command, so each attempt needs its own span id or the retry cancels the attempt before it.
 * Counted per span name rather than globally, so a concurrent Search never shifts the attempt numbers a startup span reports.
 */
function getNextRequestPhaseAttempt(spanName: string) {
    const attempt = (attemptsBySpanName.get(spanName) ?? 0) + 1;
    attemptsBySpanName.set(spanName, attempt);
    return attempt;
}

export default MEASURED_REQUEST_PHASE_COMMANDS;
export {getRequestPhaseSpanNames, getNextRequestPhaseAttempt};
