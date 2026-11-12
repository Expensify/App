import {WRITE_COMMANDS} from '@libs/API/types';
import type {Middleware} from '@libs/Request';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {AnyOnyxUpdate} from '@src/types/onyx/Request';

import type {OnyxUpdate} from 'react-native-onyx';

import Onyx from 'react-native-onyx';

const EXPENSE_WRITE_COMMANDS = new Set<string>([WRITE_COMMANDS.REQUEST_MONEY, WRITE_COMMANDS.TRACK_EXPENSE]);

const REPORT_REOPEN_COMMANDS = new Set<string>([WRITE_COMMANDS.REOPEN_REPORT, WRITE_COMMANDS.RETRACT_REPORT, WRITE_COMMANDS.UNAPPROVE_EXPENSE_REPORT]);

const REJECTED_REPORT_UUIDS = new Set<string>(CONST.REPORT_NO_LONGER_ACCEPTS_EXPENSE_UUIDS);

function getStringField(data: Record<string, unknown> | undefined, field: string): string | undefined {
    const value = data?.[field];
    return typeof value === 'string' && value ? value : undefined;
}

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
