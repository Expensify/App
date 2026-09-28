import {WRITE_COMMANDS} from '@libs/API/types';
import {isRecord} from '@libs/ObjectUtils';
import type {Middleware} from '@libs/Request';

import {getAll as getPersistedRequests} from '@userActions/PersistedRequests';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {AnyOnyxUpdate} from '@src/types/onyx/Request';

import Onyx from 'react-native-onyx';

function getServerThreadID(value: unknown): string | undefined {
    if (typeof value === 'number' || typeof value === 'string') {
        return String(value);
    }
    return undefined;
}

const reconcileBulkEditReportAction: Middleware = (requestResponse, request) =>
    requestResponse.then((response) => {
        if (
            response?.jsonCode !== CONST.JSON_CODE.SUCCESS ||
            (request.command !== WRITE_COMMANDS.UPDATE_MONEY_REQUEST && request.command !== WRITE_COMMANDS.UPDATE_MONEY_REQUEST_ATTENDEES)
        ) {
            return response;
        }

        const context = request.bulkEditActionContext;
        if (!context) {
            return response;
        }

        const localActionsKey = `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${context.threadReportID}`;
        const successData = request.successData as AnyOnyxUpdate[] | undefined;
        const actionUpdate = successData?.find((update) => update.key === localActionsKey && isRecord(update.value) && isRecord(update.value[context.actionID]));
        if (!actionUpdate || !isRecord(actionUpdate.value)) {
            return response;
        }

        const serverThreadID = getServerThreadID(response.transactionThreadReportID);
        const serverDeletedAction = response.onyxData?.some((update) => {
            const value: unknown = update.value;
            return update.key === localActionsKey && isRecord(value) && value[context.actionID] === null;
        });
        const serverSkippedAction = response.modifiedExpenseReportAction === null && serverThreadID === '0';
        const isAttendeesWithoutActionID = request.command === WRITE_COMMANDS.UPDATE_MONEY_REQUEST_ATTENDEES && !request.data?.reportActionID;
        const hasDifferentServerThread = !!serverThreadID && serverThreadID !== '0' && serverThreadID !== context.threadReportID;

        if (!serverDeletedAction && !serverSkippedAction && !isAttendeesWithoutActionID && !(context.isOptimisticThread && hasDifferentServerThread)) {
            return response;
        }

        // successData runs after the server's deletion, so clearing pendingAction would recreate a stub action.
        actionUpdate.value = {...actionUpdate.value, [context.actionID]: null};

        if (
            !context.isOptimisticThread ||
            (!serverSkippedAction && !hasDifferentServerThread && !(isAttendeesWithoutActionID && !serverThreadID)) ||
            // Later offline edits may still use this local thread. Their response can retire it once they finish.
            getPersistedRequests().some((pendingRequest) => pendingRequest.bulkEditActionContext?.threadReportID === context.threadReportID)
        ) {
            return response;
        }

        const authoritativeThreadID = serverThreadID && serverThreadID !== '0' ? serverThreadID : null;
        if (context.parentReportID && context.parentActionID) {
            successData?.push({
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${context.parentReportID}`,
                value: {[context.parentActionID]: {childReportID: authoritativeThreadID}},
            });
        }

        if (typeof request.data?.transactionID === 'string') {
            successData?.push({
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.TRANSACTION}${request.data.transactionID}`,
                value: {transactionThreadReportID: authoritativeThreadID},
            });
        }

        successData?.push(
            {onyxMethod: Onyx.METHOD.SET, key: localActionsKey, value: null},
            {onyxMethod: Onyx.METHOD.SET, key: `${ONYXKEYS.COLLECTION.REPORT}${context.threadReportID}`, value: null},
        );

        return response;
    });

export default reconcileBulkEditReportAction;
