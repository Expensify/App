import {getPreferredPolicyFromExpensifyCardSettings} from '@libs/CardUtils';
import type {ExpensifyCardFeedEntry} from '@libs/ExpensifyCardFeedSelectorUtils';

import CONST from '@src/CONST';

import {useMemo} from 'react';

import useDefaultFundID from './useDefaultFundID';
import useExpensifyCardFeedsForFeedSelector from './useExpensifyCardFeedsForFeedSelector';
import useWorkspaceAccountID from './useWorkspaceAccountID';

/**
 * The card feeds whose Continuous Reconciliation settings this workspace's admin can configure.
 *
 * Continuous Reconciliation is a per-feed setting, and a workspace can sit on more than one feed: its own
 * workspace-provisioned feed, plus any domain or other-workspace feed that lists it as preferred or linked. Those are
 * exactly the feeds `useDefaultFundID` picks between, so this returns the same set with the same feed resolved as
 * selected by default.
 */
function useReconciliationCardFeeds(policyID: string | undefined): {candidates: ExpensifyCardFeedEntry[]; defaultFundID: number} {
    const workspaceAccountID = useWorkspaceAccountID(policyID);
    const defaultFundID = useDefaultFundID(policyID);
    const {primaryFeeds, otherFeeds} = useExpensifyCardFeedsForFeedSelector(policyID);

    const candidates = useMemo(() => {
        // `primaryFeeds` are the feeds linked to this policy. A feed that merely names this policy as preferred is not
        // linked yet, but its reconciliation settings still govern this workspace's cards, so include it too. Feeds
        // being deleted are dropped: their settings are on the way out and selecting one would configure nothing.
        const preferredFeeds = otherFeeds.filter(
            (entry) => getPreferredPolicyFromExpensifyCardSettings(entry.settings)?.toUpperCase() === policyID?.toUpperCase() || entry.fundID === workspaceAccountID,
        );

        return [...primaryFeeds, ...preferredFeeds].filter((entry) => entry.settings.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE);
    }, [primaryFeeds, otherFeeds, policyID, workspaceAccountID]);

    return {candidates, defaultFundID};
}

export default useReconciliationCardFeeds;
