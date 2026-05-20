import {removeDraftTransactionsByIDs, removeTransactionReceipt} from '@userActions/TransactionEdit';
import CONST from '@src/CONST';

/**
 * Wipes leftover non-initial draft transactions and clears the receipt on the initial transaction
 * before starting a fresh scan batch. Without this, picking files after returning from a previous
 * submission can leave the previous session's drafts attached to the new batch.
 *
 * Skipped when multi-scan is on, since multi-scan within a single session accumulates drafts on purpose.
 */
function resetStaleScanDrafts(isMultiScanEnabled: boolean, draftTransactionIDs: string[] | undefined) {
    if (isMultiScanEnabled || !draftTransactionIDs || draftTransactionIDs.length === 0) {
        return;
    }
    removeDraftTransactionsByIDs(draftTransactionIDs, true);
    removeTransactionReceipt(CONST.IOU.OPTIMISTIC_TRANSACTION_ID);
}

export default resetStaleScanDrafts;
