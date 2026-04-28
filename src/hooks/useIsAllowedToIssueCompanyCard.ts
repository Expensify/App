import {getCompanyFeeds, getSelectedFeed} from '@libs/CardUtils';
import {isPolicyAdmin as isPolicyAdminPolicyUtils} from '@libs/PolicyUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import {isAdminSelector} from '@src/selectors/Domain';
import useCardFeeds from './useCardFeeds';
import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';
import useOnyx from './useOnyx';
import usePolicy from './usePolicy';

function useIsAllowedToIssueCompanyCard({policyID}: {policyID?: string}) {
    const {accountID: currentUserAccountID} = useCurrentUserPersonalDetails();
    const [lastSelectedFeed] = useOnyx(`${ONYXKEYS.COLLECTION.LAST_SELECTED_FEED}${policyID}`);
    const policy = usePolicy(policyID);
    const isPolicyAdmin = isPolicyAdminPolicyUtils(policy);

    const [cardFeeds] = useCardFeeds(policyID);
    const companyCards = getCompanyFeeds(cardFeeds);
    const selectedFeed = getSelectedFeed(lastSelectedFeed, cardFeeds);

    const selectedFeedData = selectedFeed && companyCards[selectedFeed];
    const [domain] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN}${selectedFeedData?.domainID}`);

    if (selectedFeedData?.domainID === policy?.workspaceAccountID) {
        return isPolicyAdmin;
    }

    return isAdminSelector(currentUserAccountID)(domain);
}

export default useIsAllowedToIssueCompanyCard;
