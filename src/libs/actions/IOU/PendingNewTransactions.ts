import ONYXKEYS from '@src/ONYXKEYS';
import type {PendingNewTransactionFlag} from '@src/types/onyx/ReportMetadata';

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

/** Clears only the flag instances passed in: a flag rewritten since carries a different stamp and must survive to play its own highlight. */
function deletePendingNewTransactionIDs(reportID: string | undefined, flagsToClear: Record<string, PendingNewTransactionFlag>) {
    if (!reportID || !Object.keys(flagsToClear).length) {
        return;
    }

    const metadataKey = `${ONYXKEYS.COLLECTION.REPORT_METADATA}${reportID}` as const;
    const connection = Onyx.connectWithoutView({
        key: metadataKey,
        callback: (reportMetadata) => {
            Onyx.disconnect(connection);
            const currentFlags = reportMetadata?.pendingNewTransactionIDs;
            const clearedFlags: Record<string, null> = {};
            for (const [transactionID, flaggedAt] of Object.entries(flagsToClear)) {
                if (currentFlags?.[transactionID] === flaggedAt) {
                    clearedFlags[transactionID] = null;
                }
            }
            if (!Object.keys(clearedFlags).length) {
                return;
            }
            Onyx.merge(metadataKey, {pendingNewTransactionIDs: clearedFlags});
        },
    });
}

export {addPendingNewTransactionIDs, buildPendingNewTransactionFlag, deletePendingNewTransactionIDs};
