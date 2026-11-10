import {useSearchResultsContext} from '@components/Search/SearchContext';

import {getSearchBulkEditPolicyID, isEverySearchBulkEditExpenseOwnedBy} from '@libs/SearchUIUtils';

import {withSnapshotReports, withSnapshotTransactions} from '@pages/Search/SearchEditMultiple/SearchEditMultipleUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';
import useOnyx from './useOnyx';

/**
 * Resolves what bulk editing needs from the selected transactions, using snapshot-merged collections so that expenses
 * only present in the search snapshot (e.g. after a hard refresh) are still resolved correctly: the policyID, and
 * whether every selected expense is the current user's own.
 */
function useSearchBulkEditSelection(): {policyID: string | undefined; isEverySelectedExpenseOwn: boolean} {
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

    return {
        policyID: getSearchBulkEditPolicyID(selectedTransactionIDs, activePolicyID, mergedTransactions, mergedReports),
        isEverySelectedExpenseOwn: isEverySearchBulkEditExpenseOwnedBy(selectedTransactionIDs, currentUserAccountID, mergedTransactions, mergedReports),
    };
}

/** Resolves the bulk-edit policyID from the selected transactions. */
function useSearchBulkEditPolicyID(): string | undefined {
    return useSearchBulkEditSelection().policyID;
}

export default useSearchBulkEditPolicyID;
export {useSearchBulkEditSelection};
