import {buildClearedPendingNewTransactionFlags, buildPendingNewTransactionFlagKey} from '@libs/PendingNewTransactionFlags';

import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';

/** Builds the flag entry for one add, stamped at write time so each write is its own instance. */
function buildPendingNewTransactionFlag(transactionID: string): Record<string, true> {
    return {[buildPendingNewTransactionFlagKey(transactionID, Date.now())]: true};
}

function addPendingNewTransactionIDs(reportID: string | undefined, transactionID: string | undefined) {
    if (!reportID || !transactionID) {
        return;
    }

    // We are saving in object form so that consecutive onyx merge will not reset previous value.
    Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_METADATA}${reportID}`, {pendingNewTransactionIDs: buildPendingNewTransactionFlag(transactionID)});
}

/** Clears the given flag instances, leaving any flag written since untouched because it carries a different key. */
function deletePendingNewTransactionIDs(reportID: string | undefined, flagKeys: string[]) {
    if (!reportID || !flagKeys.length) {
        return;
    }

    Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_METADATA}${reportID}`, {pendingNewTransactionIDs: buildClearedPendingNewTransactionFlags(flagKeys)});
}

export {addPendingNewTransactionIDs, buildPendingNewTransactionFlag, deletePendingNewTransactionIDs};
