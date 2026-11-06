import {isRecord} from '@libs/ObjectUtils';
import {getAllReportActions, getOriginalMessage, isMoneyRequestAction} from '@libs/ReportActionsUtils';
import {getReportOrDraftReport} from '@libs/ReportUtils';

import ONYXKEYS from '@src/ONYXKEYS';
import type {AnyOnyxUpdate} from '@src/types/onyx/Request';

import Onyx from 'react-native-onyx';

/** Keep existing expense threads attached to a confirmed scan destination when the source report is retired. */
function reconcileScannedTransactionThreads(sourceReportID: string, destinationReportID: string, responseUpdates: AnyOnyxUpdate[]): AnyOnyxUpdate[] {
    const destinationActionIDs = new Map<string, string>();
    for (const action of Object.values(getAllReportActions(destinationReportID))) {
        if (!isMoneyRequestAction(action)) {
            continue;
        }
        const transactionID = getOriginalMessage(action)?.IOUTransactionID;
        if (transactionID) {
            destinationActionIDs.set(transactionID, action.reportActionID);
        }
    }
    // The cache still describes the optimistic source while its response is being applied.
    // Prefer action identities explicitly provided for the destination by that response.
    for (const update of responseUpdates) {
        if (update.key !== `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${destinationReportID}` || !isRecord(update.value)) {
            continue;
        }
        for (const [actionID, value] of Object.entries(update.value)) {
            const message = isRecord(value) && isRecord(value.originalMessage) ? value.originalMessage : undefined;
            if (typeof message?.IOUTransactionID === 'string') {
                destinationActionIDs.set(message.IOUTransactionID, actionID);
            }
        }
    }

    const updates: AnyOnyxUpdate[] = [];
    for (const action of Object.values(getAllReportActions(sourceReportID))) {
        if (!isMoneyRequestAction(action) || !action.childReportID) {
            continue;
        }
        const threadID = String(action.childReportID);
        const thread = getReportOrDraftReport(threadID);
        const transactionID = getOriginalMessage(action)?.IOUTransactionID;
        if (!transactionID || thread?.parentReportID !== sourceReportID || thread.preexistingReportID) {
            continue;
        }
        const threadKey = `${ONYXKEYS.COLLECTION.REPORT}${threadID}` as const;
        const threadUpdates = responseUpdates.filter((update) => update.key === threadKey);
        // Never resurrect a deleted/replaced thread or override its server-provided parent fields.
        if (threadUpdates.some((update) => update.value === null || (isRecord(update.value) && !!update.value.preexistingReportID))) {
            continue;
        }
        const shouldFillField = (field: string) => threadUpdates.every((update) => !isRecord(update.value) || update.value[field] === undefined);
        updates.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: threadKey,
            value: {
                ...(shouldFillField('parentReportID') ? {parentReportID: destinationReportID} : {}),
                ...(shouldFillField('parentReportActionID') ? {parentReportActionID: destinationActionIDs.get(transactionID) ?? action.reportActionID} : {}),
                ...(thread.chatReportID === sourceReportID && shouldFillField('chatReportID') ? {chatReportID: destinationReportID} : {}),
            },
        });
    }
    return updates;
}

export default reconcileScannedTransactionThreads;
