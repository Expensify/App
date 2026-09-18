import {getDomainByFundID, getLinkedPolicyIDsFromExpensifyCardSettings, getPreferredPolicyFromExpensifyCardSettings, isPolicyIDInLinkedExpensifyCardPolicyList} from '@libs/CardUtils';
import type {ExpensifyCardFeedEntry} from '@libs/ExpensifyCardFeedSelectorUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import useDefaultFundID from './useDefaultFundID';
import useExpensifyCardFeedsForFeedSelector from './useExpensifyCardFeedsForFeedSelector';
import useOnyx from './useOnyx';
import useWorkspaceAccountID from './useWorkspaceAccountID';

/**
 * The card feeds whose Continuous Reconciliation settings this workspace's admin can configure.
 *
 * Continuous Reconciliation is a per-feed setting, and enabling it claims the feed's export policy for this workspace.
 * That makes the candidates narrower than the feeds the admin can merely see: this workspace's own feed, plus any domain
 * feed that is not already claimed by a different workspace. Another workspace's feed is never offered, because its
 * export policy is not this workspace's to claim.
 */
function useReconciliationCardFeeds(policyID: string | undefined): {candidates: ExpensifyCardFeedEntry[]; defaultFundID: number} {
    const workspaceAccountID = useWorkspaceAccountID(policyID);
    const defaultFundID = useDefaultFundID(policyID);
    const {allFeeds} = useExpensifyCardFeedsForFeedSelector(policyID);
    const [domains] = useOnyx(ONYXKEYS.COLLECTION.DOMAIN);

    const candidates = allFeeds.filter((entry) => {
        if (entry.settings.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE) {
            return false;
        }

        if (entry.fundID === workspaceAccountID) {
            return true;
        }

        // Only a domain feed can be claimed from here. A feed backed by another workspace's account is that
        // workspace's to reconcile, however this policy relates to it.
        if (!getDomainByFundID(domains, entry.fundID)) {
            return false;
        }

        const preferredPolicyID = getPreferredPolicyFromExpensifyCardSettings(entry.settings);
        if (preferredPolicyID) {
            return !!policyID && preferredPolicyID.toUpperCase() === policyID.toUpperCase();
        }

        // An unclaimed domain feed is only offered once this workspace is linked to it. Without a link there is
        // no relationship to reconcile, so claiming it here would come out of nowhere.
        return !!policyID && isPolicyIDInLinkedExpensifyCardPolicyList(getLinkedPolicyIDsFromExpensifyCardSettings(entry.settings), policyID);
    });

    // Resolve the default from the candidates only. useDefaultFundID prioritizes the last-selected-feed NVP, which the
    // Expensify Card pages set and which can name a feed this page rejects, so returning it unchecked would let the
    // toggle act on a feed whose export policy is not this workspace's to claim.
    const findCandidate = (fundID: number) => candidates.find((entry) => entry.fundID === fundID);
    const resolvedFundID = findCandidate(workspaceAccountID) ?? findCandidate(defaultFundID) ?? candidates.at(0);

    return {candidates, defaultFundID: resolvedFundID?.fundID ?? CONST.DEFAULT_NUMBER_ID};
}

export default useReconciliationCardFeeds;
