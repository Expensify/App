import {getCompanyFeeds, getSelectedFeed} from '@libs/CardUtils';
import {isPolicyAdmin as isPolicyAdminPolicyUtils} from '@libs/PolicyUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import useCardFeeds from './useCardFeeds';
import useOnyx from './useOnyx';
import usePolicy from './usePolicy';

function useIsAllowedToIssueCompanyCard({policyID}: {policyID?: string}) {
    const [lastSelectedFeed] = useOnyx(`${ONYXKEYS.COLLECTION.LAST_SELECTED_FEED}${policyID}`, {canBeMissing: true});
    const policy = usePolicy(policyID);
    const isPolicyAdmin = isPolicyAdminPolicyUtils(policy);

    const [cardFeeds] = useCardFeeds(policyID);
    const companyCards = getCompanyFeeds(cardFeeds);
    const selectedFeed = getSelectedFeed(lastSelectedFeed, cardFeeds);

    const selectedFeedData = selectedFeed && companyCards[selectedFeed];
    const [adminAccess] = useOnyx(`${ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_ADMIN_ACCESS}${selectedFeedData?.domainID}`, {canBeMissing: true});

    if (selectedFeedData?.domainID === policy?.workspaceAccountID) {
        return isPolicyAdmin;
    }

    return !!adminAccess;
}

export default useIsAllowedToIssueCompanyCard;
