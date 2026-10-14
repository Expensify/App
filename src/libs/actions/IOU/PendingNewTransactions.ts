import {buildClearedPendingNewTransactionFlags, buildPendingNewTransactionFlag, buildPendingNewTransactionFlagKey} from '@libs/PendingNewTransactionFlags';

import ONYXKEYS from '@src/ONYXKEYS';

import type {OnyxUpdate} from 'react-native-onyx';

import Onyx from 'react-native-onyx';

/** Highlight flag writers. An expense report's flags are read by its table, a chat's by its expense preview. A reportID alone can't say which. */

type ReportMetadataUpdate = OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT_METADATA>;

/** Whether each report showed rows when the current action began. From an action's second add the report includes the first, so every add uses the first answer. */
const reportsShowingRowsWhenActionBegan = new Map<string, boolean>();

/** Answers once per report per action. Cleared a microtask later, when the action's synchronous run ends. */
function wasReportShowingRowsWhenActionBegan(reportID: string, isShowingRowsNow: () => boolean): boolean {
    const answeredForThisAction = reportsShowingRowsWhenActionBegan.get(reportID);
    if (answeredForThisAction !== undefined) {
        return answeredForThisAction;
    }
    const isShowingRows = isShowingRowsNow();
    const isFirstAnswerOfThisAction = reportsShowingRowsWhenActionBegan.size === 0;
    reportsShowingRowsWhenActionBegan.set(reportID, isShowingRows);
    if (isFirstAnswerOfThisAction) {
        Promise.resolve().then(() => reportsShowingRowsWhenActionBegan.clear());
    }
    return isShowingRows;
}

/** Flags a transaction for the expense preview in this chat. */
function flagNewTransactionForChatPreview({chatReportID, transactionID}: {chatReportID: string | undefined; transactionID: string | undefined}) {
    if (!chatReportID || !transactionID) {
        return;
    }

    // We are saving in object form so that consecutive onyx merge will not reset previous value.
    Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_METADATA}${chatReportID}`, {pendingNewTransactionIDs: buildPendingNewTransactionFlag(transactionID)});
}

/** Flags a transaction for the expense report's table. The write and its rollback share one key, so the rollback clears only this instance. */
function buildNewTransactionFlagForReportTable({expenseReportID, transactionID}: {expenseReportID: string; transactionID: string}): {
    optimisticUpdate: ReportMetadataUpdate;
    failureUpdate: ReportMetadataUpdate;
} {
    const flagKey = buildPendingNewTransactionFlagKey(transactionID, Date.now());
    const metadataKey = `${ONYXKEYS.COLLECTION.REPORT_METADATA}${expenseReportID}` as const;
    return {
        optimisticUpdate: {onyxMethod: Onyx.METHOD.MERGE, key: metadataKey, value: {pendingNewTransactionIDs: {[flagKey]: true}}},
        failureUpdate: {onyxMethod: Onyx.METHOD.MERGE, key: metadataKey, value: {pendingNewTransactionIDs: buildClearedPendingNewTransactionFlags([flagKey])}},
    };
}

/** Clears these flag instances. A flag written since has another key and survives. */
function deletePendingNewTransactionIDs(reportID: string | undefined, flagKeys: string[]) {
    if (!reportID || !flagKeys.length) {
        return;
    }

    Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_METADATA}${reportID}`, {pendingNewTransactionIDs: buildClearedPendingNewTransactionFlags(flagKeys)});
}

export {buildNewTransactionFlagForReportTable, deletePendingNewTransactionIDs, flagNewTransactionForChatPreview, wasReportShowingRowsWhenActionBegan};
