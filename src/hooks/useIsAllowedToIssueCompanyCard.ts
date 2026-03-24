import {getCompanyFeeds, getSelectedFeed} from '@libs/CardUtils';
import {isPolicyAdmin as isPolicyAdminPolicyUtils} from '@libs/PolicyUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import useCardFeeds from './useCardFeeds';
import useOnyx from './useOnyx';
import usePolicy from './usePolicy';

function useIsAllowedToIssueCompanyCard({policyID}: {policyID?: string}) {
    const [lastSelectedFeed] = useOnyx(`${ONYXKEYS.COLLECTION.LAST_SELECTED_FEED}${policyID}`);
    const policy = usePolicy(policyID);
    const isPolicyAdmin = isPolicyAdminPolicyUtils(policy);

    const [cardFeeds] = useCardFeeds(policyID);
    const companyCards = getCompanyFeeds(cardFeeds);
    const selectedFeed = getSelectedFeed(lastSelectedFeed, cardFeeds);

    const selectedFeedData = selectedFeed && companyCards[selectedFeed];
    const [adminAccess] = useOnyx(`${ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_ADMIN_ACCESS}${selectedFeedData?.domainID}`);

    if (selectedFeedData?.domainID === policy?.workspaceAccountID) {
        return isPolicyAdmin;
    }

    // When adminAccess hasn't been loaded yet (user hasn't visited Domain page),
    // fall back to isPolicyAdmin to avoid silently blocking the action.
    // The server validates domain admin access on the actual AssignCompanyCard API call.
    if (adminAccess === undefined) {
        return isPolicyAdmin;
    }

    return !!adminAccess;
}

export default useIsAllowedToIssueCompanyCard;
