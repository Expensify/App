import type {OnyxCollection} from 'react-native-onyx';
import type {CardFeedForDisplay} from '@libs/CardFeedUtils';
import {getCardFeedsForDisplayPerPolicy} from '@libs/CardFeedUtils';
import {isCustomFeed} from '@libs/CardUtils';
import {isPaidGroupPolicy} from '@libs/PolicyUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy} from '@src/types/onyx';
import type {CardFeedWithNumber} from '@src/types/onyx/CardFeeds';
import useFeedKeysWithAssignedCards from './useFeedKeysWithAssignedCards';
import useLocalize from './useLocalize';
import useOnyx from './useOnyx';

const eligiblePoliciesSelector = (policies: OnyxCollection<Policy>): string[] => {
    return Object.values(policies ?? {}).reduce((policiesIDs, policy) => {
        if (isPaidGroupPolicy(policy) && policy?.areCompanyCardsEnabled) {
            policiesIDs.push(policy.id);
        }
        return policiesIDs;
    }, [] as string[]);
};

function getDefaultCardFeed(
    eligiblePoliciesIDsArray: string[] | undefined,
    activePolicyID: string | undefined,
    cardFeedsByPolicy: Record<string, CardFeedForDisplay[]>,
    localeCompare: (a: string, b: string) => number,
): CardFeedForDisplay | undefined {
    const eligiblePoliciesIDs = new Set(eligiblePoliciesIDsArray);

    // Prioritize the active policy if eligible
    if (activePolicyID && eligiblePoliciesIDs.has(activePolicyID)) {
        const policyCardFeeds = cardFeedsByPolicy[activePolicyID];
        if (policyCardFeeds?.length) {
            return [...policyCardFeeds].sort((a, b) => localeCompare(a.name, b.name)).at(0);
        }
    }

    // If the active policy doesn't have card feeds, use the first eligible policy that does
    for (const eligiblePolicyID of eligiblePoliciesIDs) {
        const policyCardFeeds = cardFeedsByPolicy[eligiblePolicyID];
        if (policyCardFeeds?.length) {
            return [...policyCardFeeds].sort((a, b) => localeCompare(a.name, b.name)).at(0);
        }
    }

    // Commercial feeds don't have preferred policies, so we need to include these in the list
    const commercialFeeds = Object.values(cardFeedsByPolicy)
        .flat()
        .filter((feed) => !isCustomFeed(feed.name as CardFeedWithNumber));

    return commercialFeeds.sort((a, b) => localeCompare(a.name, b.name)).at(0);
}

const useCardFeedsForDisplay = () => {
    const {localeCompare, translate} = useLocalize();
    const [allFeeds] = useOnyx(ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER);
    const feedKeysWithCards = useFeedKeysWithAssignedCards();
    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID);
    const [eligiblePoliciesIDsArray] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {
        selector: eligiblePoliciesSelector,
    });

    const cardFeedsByPolicy = getCardFeedsForDisplayPerPolicy(allFeeds, translate, feedKeysWithCards);

    const defaultCardFeed = getDefaultCardFeed(eligiblePoliciesIDsArray, activePolicyID, cardFeedsByPolicy, localeCompare);

    return {defaultCardFeed, cardFeedsByPolicy};
};

export default useCardFeedsForDisplay;
