import {useSearchResultsContext} from '@components/Search/SearchContext';

import {getSearchBulkEditExpenseOwnerAccountID, getSearchBulkEditPolicyID} from '@libs/SearchUIUtils';

import {withSnapshotReports, withSnapshotTransactions} from '@pages/Search/SearchEditMultiple/SearchEditMultipleUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';
import useOnyx from './useOnyx';

/**
 * Resolves what bulk editing needs from the selected transactions, using snapshot-merged collections so that expenses
 * only present in the search snapshot (e.g. after a hard refresh) are still resolved correctly: the policyID, the
 * account that owns every selected expense (undefined when the owners differ), and whether that's the current user.
 */
function useSearchBulkEditSelection(): {policyID: string | undefined; ownerAccountID: number | undefined; isEverySelectedExpenseOwn: boolean} {
    const {currentSearchResults} = useSearchResultsContext();
    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID);
    const [draftTransaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${CONST.IOU.OPTIMISTIC_BULK_EDIT_TRANSACTION_ID}`);
    const [allTransactions] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION);
    const [allReports] = useOnyx(ONYXKEYS.COLLECTION.REPORT);
    const {accountID: currentUserAccountID} = useCurrentUserPersonalDetails();

    const snapshotData = currentSearchResults?.data;
    const mergedTransactions = withSnapshotTransactions(allTransactions, snapshotData);
    const mergedReports = withSnapshotReports(allReports, snapshotData);

    const selectedTransactionIDs = draftTransaction?.selectedTransactionIDs ?? [];
    const ownerAccountID = getSearchBulkEditExpenseOwnerAccountID(selectedTransactionIDs, currentUserAccountID, mergedTransactions, mergedReports);

    return {
        policyID: getSearchBulkEditPolicyID(selectedTransactionIDs, activePolicyID, mergedTransactions, mergedReports),
        ownerAccountID,
        isEverySelectedExpenseOwn: ownerAccountID === currentUserAccountID,
    };
}

/** Resolves the bulk-edit policyID from the selected transactions. */
function useSearchBulkEditPolicyID(): string | undefined {
    return useSearchBulkEditSelection().policyID;
}

export default useSearchBulkEditPolicyID;
export {useSearchBulkEditSelection};
