import {useSearchStateContext} from '@components/Search/SearchContext';
import {getSearchBulkEditPolicyID} from '@libs/SearchUIUtils';
import {withSnapshotReports, withSnapshotTransactions} from '@pages/Search/SearchEditMultiple/SearchEditMultipleUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import useOnyx from './useOnyx';

/**
 * Resolves the bulk-edit policyID from the selected transactions, using
 * snapshot-merged collections so that expenses only present in the search
 * snapshot (e.g. after a hard refresh) are still resolved correctly.
 */
function useSearchBulkEditPolicyID(): string | undefined {
    const {currentSearchResults} = useSearchStateContext();
    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID);
    const [draftTransaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${CONST.IOU.OPTIMISTIC_BULK_EDIT_TRANSACTION_ID}`);
    const [allTransactions] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION);
    const [allReports] = useOnyx(ONYXKEYS.COLLECTION.REPORT);

    const snapshotData = currentSearchResults?.data;
    const mergedTransactions = withSnapshotTransactions(allTransactions, snapshotData);
    const mergedReports = withSnapshotReports(allReports, snapshotData);

    const selectedTransactionIDs = draftTransaction?.selectedTransactionIDs ?? [];

    return getSearchBulkEditPolicyID(selectedTransactionIDs, activePolicyID, mergedTransactions, mergedReports);
}

export default useSearchBulkEditPolicyID;
