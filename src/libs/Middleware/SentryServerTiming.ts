import {WRITE_COMMANDS} from '@libs/API/types';
import {cancelSpan, endSpan, getSpan, startSpan} from '@libs/telemetry/activeSpans';
import CONST from '@src/CONST';
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
];

/**
 * Finds the tracked command group for a given command, if any.
 */
function findTrackedGroup(command: string): TrackedCommandGroup | undefined {
    return TRACKED_COMMAND_GROUPS.find((group) => group.commands.has(command));
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

    const spanId = `${group.spanOp}_${request.requestID}`;
    startSpan(spanId, {
        name: group.spanName,
        op: group.spanOp,
        attributes: {
            [CONST.TELEMETRY.ATTRIBUTE_COMMAND]: request.command,
        },
    });

    return response
        .then((data) => {
            const span = getSpan(spanId);
            span?.setAttributes({
                [CONST.TELEMETRY.ATTRIBUTE_JSON_CODE]: data?.jsonCode,
            });
            endSpan(spanId);
            return data;
        })
        .catch((error) => {
            cancelSpan(spanId);
            throw error;
        });
};

export default SentryServerTiming;
