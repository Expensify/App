import {useEffect} from 'react';
import {useSearchQueryContext} from '@components/Search/SearchContext';
import {approveMoneyRequestOnSearch} from '@libs/actions/Search';
import {isSubmitPolicy} from '@libs/PolicyUtils';
import {clearPendingWorkspaceUpgradeIntent} from '@userActions/IOU/ReportWorkflow';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import useOnyx from './useOnyx';

function useReplayPendingWorkspaceUpgradeApprovalOnSearch() {
    const [pendingWorkspaceUpgradeIntent] = useOnyx(ONYXKEYS.PENDING_WORKSPACE_UPGRADE_INTENT);
    const {currentSearchHash, currentSearchKey} = useSearchQueryContext();

    const searchUpgradeIntent = pendingWorkspaceUpgradeIntent?.type === CONST.WORKSPACE_UPGRADE_INTENT_TYPES.APPROVE_MONEY_REQUEST_ON_SEARCH ? pendingWorkspaceUpgradeIntent : undefined;
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${searchUpgradeIntent?.policyID}`);

    useEffect(() => {
        if (!searchUpgradeIntent) {
            return;
        }

        if (!policy?.id || searchUpgradeIntent.policyID !== policy.id) {
            return;
        }

        if (isSubmitPolicy(policy) || policy.isPendingUpgrade) {
            return;
        }

        if (searchUpgradeIntent.searchHash !== currentSearchHash) {
            return;
        }

        // Clear first to avoid loops if something navigates/re-renders mid-flight.
        clearPendingWorkspaceUpgradeIntent();

        approveMoneyRequestOnSearch(searchUpgradeIntent.searchHash, [searchUpgradeIntent.reportID], searchUpgradeIntent.currentSearchKey ?? currentSearchKey);
    }, [
        currentSearchHash,
        currentSearchKey,
        policy,
        searchUpgradeIntent,
        searchUpgradeIntent?.currentSearchKey,
        searchUpgradeIntent?.policyID,
        searchUpgradeIntent?.reportID,
        searchUpgradeIntent?.searchHash,
    ]);
}

export default useReplayPendingWorkspaceUpgradeApprovalOnSearch;
