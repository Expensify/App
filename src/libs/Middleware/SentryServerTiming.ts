import {readUpdateIDFrom} from '@libs/actions/RequestConflictUtils';
import {SIDE_EFFECT_REQUEST_COMMANDS, WRITE_COMMANDS} from '@libs/API/types';
import {cancelSpan, endSpanWithAttributes, startSpan} from '@libs/telemetry/activeSpans';

import CONST from '@src/CONST';

import type {SpanAttributes} from '@sentry/core';

import type Middleware from './types';

/**
 * Configuration for a tracked command group.
 * Maps a set of write commands to a Sentry span operation name.
 */
type TrackedCommandGroup = {
    /** Set of write commands that should be instrumented */
    commands: Set<string>;
    /** Sentry span operation name */
    spanOp: string;
    /** Human-readable span name */
    spanName: string;
};

/**
 * Registry of command groups to instrument with server round-trip timing.
 * Add new entries here to track additional flows without creating new middlewares.
 */
const TRACKED_COMMAND_GROUPS: TrackedCommandGroup[] = [
    {
        commands: new Set<string>([
            WRITE_COMMANDS.REQUEST_MONEY,
            WRITE_COMMANDS.CREATE_PER_DIEM_REQUEST,
            WRITE_COMMANDS.SPLIT_BILL,
            WRITE_COMMANDS.SPLIT_BILL_AND_OPEN_REPORT,
            WRITE_COMMANDS.START_SPLIT_BILL,
            WRITE_COMMANDS.CREATE_DISTANCE_REQUEST,
            WRITE_COMMANDS.TRACK_EXPENSE,
            WRITE_COMMANDS.SEND_INVOICE,
        ]),
        spanOp: CONST.TELEMETRY.SPAN_EXPENSE_SERVER_RESPONSE,
        spanName: 'expense-server-response',
    },
    {
        commands: new Set<string>([SIDE_EFFECT_REQUEST_COMMANDS.RECONNECT_APP, SIDE_EFFECT_REQUEST_COMMANDS.GET_MISSING_ONYX_MESSAGES]),
        spanOp: CONST.TELEMETRY.SPAN_RECONNECT_SERVER_RESPONSE,
        spanName: 'reconnect-server-response',
    },
];

/**
 * Finds the tracked command group for a given command, if any.
 */
function findTrackedGroup(command: string): TrackedCommandGroup | undefined {
    return TRACKED_COMMAND_GROUPS.find((group) => group.commands.has(command));
}

/**
 * Distinguishes the spans of overlapping requests. `requestIndex` only exists on persisted write requests, so
 * side-effect commands like GetMissingOnyxMessages would otherwise all share one span id, and starting the next
 * span would cancel the one still in flight.
 */
let spanSequence = 0;

/**
 * Whether a reconnect response carried a newer update ceiling than the request asked to catch up from.
 * A request with no `updateIDFrom` refetches everything, so there is nothing to advance past and the
 * answer is left off the span. Sentry cannot compare one attribute against another, so this verdict has
 * to be computed here rather than left to a query.
 */
function didResponseAdvance(updateIDFrom: number | undefined, lastUpdateID: number | string | undefined): boolean | undefined {
    if (updateIDFrom === undefined) {
        return undefined;
    }
    return Number(lastUpdateID ?? CONST.DEFAULT_NUMBER_ID) > updateIDFrom;
}

/**
 * Middleware that tracks server round-trip time for configured command groups via Sentry spans.
 * For non-tracked commands, this is a no-op pass-through.
 *
 * To add tracking for a new flow, add an entry to TRACKED_COMMAND_GROUPS above.
 */
const SentryServerTiming: Middleware = (response, request) => {
    const group = findTrackedGroup(request.command);
    if (!group) {
        return response;
    }

    const updateIDFrom = readUpdateIDFrom(request.data);
    spanSequence += 1;
    const spanId = `${group.spanOp}_${spanSequence}`;
    startSpan(spanId, {
        name: group.spanName,
        op: group.spanOp,
        attributes: {
            [CONST.TELEMETRY.ATTRIBUTE_COMMAND]: request.command,
            [CONST.TELEMETRY.ATTRIBUTE_UPDATE_ID_FROM]: updateIDFrom,
        },
    });

    return response
        .then((data) => {
            const attributes: SpanAttributes = {
                [CONST.TELEMETRY.ATTRIBUTE_JSON_CODE]: data?.jsonCode,
                [CONST.TELEMETRY.ATTRIBUTE_RESPONSE_ADVANCED]: didResponseAdvance(updateIDFrom, data?.lastUpdateID),
            };
            endSpanWithAttributes(spanId, attributes);
            return data;
        })
        .catch((error) => {
            cancelSpan(spanId);
            throw error;
        });
};

export default SentryServerTiming;
