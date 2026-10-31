/**
 * Reconciles Bulk Edit's optimistic actions and threads with Auth responses before queued successData
 * can recreate an action or thread that the server skipped or replaced.
 */
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
        const localReportKey = `${ONYXKEYS.COLLECTION.REPORT}${context.threadReportID}`;
        const successData = request.successData as AnyOnyxUpdate[] | undefined;
        const actionUpdate = successData?.find((update) => update.key === localActionsKey && isRecord(update.value) && isRecord(update.value[context.actionID]));
        if (!actionUpdate || !isRecord(actionUpdate.value)) {
            return response;
        }

        let serverThreadID = getServerThreadID(response.transactionThreadReportID);
        if (!serverThreadID) {
            // Attendee responses may omit thread metadata. Only an unambiguous server update for this action identifies its thread.
            const actionThreadIDs = new Set<string>();
            for (const update of response.onyxData ?? []) {
                const value: unknown = update.value;
                if (!update.key.startsWith(ONYXKEYS.COLLECTION.REPORT_ACTIONS) || !isRecord(value) || (value[context.actionID] !== null && !isRecord(value[context.actionID]))) {
                    continue;
                }
                const threadID = update.key.slice(ONYXKEYS.COLLECTION.REPORT_ACTIONS.length);
                if (threadID) {
                    actionThreadIDs.add(threadID);
                }
            }
            if (actionThreadIDs.size === 1) {
                serverThreadID = actionThreadIDs.values().next().value;
            }
        }
        const serverDeletedAction = response.onyxData?.some((update) => {
            const value: unknown = update.value;
            return update.key === localActionsKey && isRecord(value) && value[context.actionID] === null;
        });
        const serverSkippedAction = response.modifiedExpenseReportAction === null && serverThreadID === '0';
        const isAttendeesWithoutActionID = request.command === WRITE_COMMANDS.UPDATE_MONEY_REQUEST_ATTENDEES && !request.data?.reportActionID;
        const hasDifferentServerThread = !!serverThreadID && serverThreadID !== '0' && serverThreadID !== context.threadReportID;

        // Reconcile only when the server deleted the action, created neither action nor thread (ID 0),
        // received no attendee action ID, or used a different thread than the local-only one.
        // Otherwise the pending-state cleanup must preserve the action, including one saved by an earlier retry.
        if (!serverDeletedAction && !serverSkippedAction && !isAttendeesWithoutActionID && !(context.isOptimisticThread && hasDifferentServerThread)) {
            return response;
        }

        // successData runs after the server's deletion, so clearing pendingAction would recreate a stub action.
        actionUpdate.value = {...actionUpdate.value, [context.actionID]: null};

        if (
            !context.isOptimisticThread ||
            (!serverSkippedAction && !hasDifferentServerThread && !(isAttendeesWithoutActionID && !serverThreadID)) ||
            // Non-bulk edits can also write to this thread after their response, so their queued cleanup must keep it alive.
            getPersistedRequests().some(
                (pendingRequest) =>
                    pendingRequest.bulkEditActionContext?.threadReportID === context.threadReportID ||
                    [pendingRequest.successData, pendingRequest.failureData, pendingRequest.finallyData, pendingRequest.queueFlushedData].some((updates) =>
                        updates?.some((update) => update.key === localActionsKey || update.key === localReportKey),
                    ),
            )
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

        successData?.push({onyxMethod: Onyx.METHOD.SET, key: localActionsKey, value: null}, {onyxMethod: Onyx.METHOD.SET, key: localReportKey, value: null});

        return response;
    });

export default reconcileBulkEditReportAction;
