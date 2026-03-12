import type {OnyxCollection} from 'react-native-onyx';
import {getCardFeedsForDisplayPerPolicy} from '@libs/CardFeedUtils';
import {getActivePolicies, isPaidGroupPolicy} from '@libs/PolicyUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy} from '@src/types/onyx';
import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';
import useFeedKeysWithAssignedCards from './useFeedKeysWithAssignedCards';
import useLocalize from './useLocalize';
import useOnyx from './useOnyx';

function useEligiblePoliciesSelector() {
    const {login: currentUserLogin} = useCurrentUserPersonalDetails();
    return (policies: OnyxCollection<Policy>) => {
        const activePolicies = getActivePolicies(policies, currentUserLogin);
        return Object.values(activePolicies ?? {}).reduce((policiesIDs, policy) => {
            if (isPaidGroupPolicy(policy) && policy?.areCompanyCardsEnabled) {
                policiesIDs.push(policy.id);
            }
            return policiesIDs;
        }, [] as string[]);
    };
}

const useCardFeedsForActivePolicies = () => {
    const {translate} = useLocalize();
    const [allFeeds] = useOnyx(ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER);
    const feedKeysWithCards = useFeedKeysWithAssignedCards();
    const eligiblePoliciesSelector = useEligiblePoliciesSelector();
    const [eligiblePoliciesIDsArray] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {
        selector: eligiblePoliciesSelector,
    });

    const allCardFeedsByPolicy = getCardFeedsForDisplayPerPolicy(allFeeds, translate, feedKeysWithCards);
    const eligiblePolicyIdsSet = new Set(eligiblePoliciesIDsArray ?? []);
    const cardFeedsByPolicy = Object.fromEntries(Object.entries(allCardFeedsByPolicy).filter(([policyID]) => eligiblePolicyIdsSet.has(policyID)));

    return {cardFeedsByPolicy};
};

export default useCardFeedsForActivePolicies;
