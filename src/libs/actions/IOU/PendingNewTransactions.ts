import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type Transaction from '@src/types/onyx/Transaction';

import Onyx from 'react-native-onyx';

// The 1→2 transaction transition causes MoneyRequestReportActionsList to fresh-mount, breaking diff-based new transaction detection.
// This helper detects that transition so callers can register pending IDs for the fallback highlight path.
function isOneToTwoTransactionTransition(isMoneyRequestReport: boolean, transactions: Transaction[]) {
    return isMoneyRequestReport && transactions.filter((t) => t.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE).length === 1;
}

function addPendingNewTransactionIDs(reportID: string | undefined, transactionID: string | undefined) {
    if (!reportID || !transactionID) {
        return;
    }

    // We are saving in object form so that consecutive onyx merge will not reset previous value.
    Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_METADATA}${reportID}`, {pendingNewTransactionIDs: {[transactionID]: true}});
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

export {addPendingNewTransactionIDs, deletePendingNewTransactionIDs, isOneToTwoTransactionTransition};
