/**
 * Notes the reports that refused a new expense, so the money request flow stops aiming another expense at them.
 */
import {WRITE_COMMANDS} from '@libs/API/types';
import type {Middleware} from '@libs/Request';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {AnyOnyxUpdate} from '@src/types/onyx/Request';

import type {OnyxUpdate} from 'react-native-onyx';

import Onyx from 'react-native-onyx';

/** Commands that aim a new expense at the report named in their parameters, and can be refused for that report's state. */
const EXPENSE_WRITE_COMMANDS = new Set<string>([WRITE_COMMANDS.REQUEST_MONEY, WRITE_COMMANDS.TRACK_EXPENSE]);

/** Commands that move a report back into a state that accepts expenses, which retires the note. */
const REPORT_REOPEN_COMMANDS = new Set<string>([WRITE_COMMANDS.REOPEN_REPORT, WRITE_COMMANDS.RETRACT_REPORT, WRITE_COMMANDS.UNAPPROVE_EXPENSE_REPORT]);

/**
 * The Web-Expensify throw sites that reject a new expense because of the state of the report it was aimed at. They all
 * answer 666 with the same English message, so this identifies them by the per-site UUID the response carries: a
 * rewording of the message does not move a UUID.
 */
const REJECTED_REPORT_UUIDS = new Set<string>(CONST.REPORT_NO_LONGER_ACCEPTS_EXPENSE_UUIDS);

function getStringField(data: Record<string, unknown> | undefined, field: string): string | undefined {
    const value = data?.[field];
    return typeof value === 'string' && value ? value : undefined;
}

/**
 * The server answers these refusals with nothing but an error message and no corrective report state, so nothing tells
 * the client the report left the writable states. The approval or close behind it rides to us on the user channel as a
 * separate update, and when that update is dropped the local status stays open and every status-based guard keeps
 * agreeing with the server right up until the next expense is refused the same way. The note is RAM-only because it is
 * a claim about state we have not re-read: the next OpenApp either corrects the status or accepts the expense, and a
 * report the server reopened across a reload should not stay blocked for a refusal it has withdrawn.
 *
 * Running here rather than from the action that wrote covers requests that went out while offline and replayed after a
 * reload, since those come back through this same pipeline.
 */
const handleRejectedExpenseReport: Middleware = (requestResponse, request) =>
    requestResponse.then((response) => {
        const command = request?.command;
        if (!command) {
            return response;
        }

        const isExpenseCommand = EXPENSE_WRITE_COMMANDS.has(command);
        const refusedAnExpense = isExpenseCommand && response?.jsonCode === CONST.JSON_CODE.EXP_ERROR && !!response.UUID && REJECTED_REPORT_UUIDS.has(response.UUID);
        const reopenedReport = REPORT_REOPEN_COMMANDS.has(command) && response?.jsonCode === CONST.JSON_CODE.SUCCESS;
        if (!refusedAnExpense && !reopenedReport) {
            return response;
        }

        const reportID = getStringField(request.data, isExpenseCommand ? 'iouReportID' : 'reportID');
        if (!reportID) {
            return response;
        }

        const update: OnyxUpdate<typeof ONYXKEYS.COLLECTION.RAM_ONLY_REJECTED_EXPENSE_REPORT> = {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.RAM_ONLY_REJECTED_EXPENSE_REPORT}${reportID}`,
            value: refusedAnExpense ? true : null,
        };

        // Handing the update to the request rather than writing it here pairs it with the handling that belongs with it:
        // failureData applies with the rollback after a refusal, successData with the update after a reopen. Both are
        // applied by SaveResponseInOnyx, which this middleware runs ahead of.
        if (refusedAnExpense) {
            if (!request.failureData) {
                request.failureData = [];
            }
            (request.failureData as AnyOnyxUpdate[]).push(update);
        } else {
            if (!request.successData) {
                request.successData = [];
            }
            (request.successData as AnyOnyxUpdate[]).push(update);
        }

        return response;
    });

export default handleRejectedExpenseReport;
