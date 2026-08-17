import {READ_COMMANDS} from '@libs/API/types';
import isStartupNetworkRequest from '@libs/AppStartupNetworkRequest';

import CONST from '@src/CONST';

/**
 * Commands whose request is broken down into phase spans (server wait, download, Onyx apply).
 * The instrumentation itself is command-agnostic; only the span names differ per command.
 * Keep this list short: every command here emits several spans per request.
 */
function isMeasuredRequestPhaseCommand(command?: string): boolean {
    return isStartupNetworkRequest(command) || command === READ_COMMANDS.SEARCH;
}

/** Each command reports into its own span names, so a new measured command never dilutes an existing metric's history in Sentry. */
function getRequestPhaseSpanNames(command?: string) {
    return isStartupNetworkRequest(command) ? CONST.TELEMETRY.SPAN_STARTUP_DATA : CONST.TELEMETRY.SPAN_SEARCH_DATA;
}

const attemptsBySpanName = new Map<string, number>();

/** Counted per span name rather than globally, so a concurrent Search never shifts the attempt numbers a startup span reports. */
function getNextRequestPhaseAttempt(spanName: string) {
    const attempt = (attemptsBySpanName.get(spanName) ?? 0) + 1;
    attemptsBySpanName.set(spanName, attempt);
    return attempt;
}

export default isMeasuredRequestPhaseCommand;
export {getRequestPhaseSpanNames, getNextRequestPhaseAttempt};
