import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';

function buildPendingNewTransactionFlag(transactionID: string): Record<string, number> {
    return {[transactionID]: Date.now()};
}

function addPendingNewTransactionIDs(reportID: string | undefined, transactionID: string | undefined) {
    if (!reportID || !transactionID) {
        return;
    }

    // We are saving in object form so that consecutive onyx merge will not reset previous value.
    Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_METADATA}${reportID}`, {pendingNewTransactionIDs: buildPendingNewTransactionFlag(transactionID)});
}

function deletePendingNewTransactionIDs(reportID: string | undefined, transactionIDs: string[]) {
    if (!reportID) {
        return;
    }

    const pendingNewTransactionIDs: Record<string, null> = {};
    for (const transactionID of transactionIDs) {
        Object.assign(pendingNewTransactionIDs, {[transactionID]: null});
    }
    Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_METADATA}${reportID}`, {pendingNewTransactionIDs});
}

export {addPendingNewTransactionIDs, buildPendingNewTransactionFlag, deletePendingNewTransactionIDs};
