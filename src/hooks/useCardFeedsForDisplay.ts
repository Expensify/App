import type {OnyxCollection} from 'react-native-onyx';
import {getCardFeedsForDisplayPerPolicy} from '@libs/CardFeedUtils';
import {isCustomFeed} from '@libs/CardUtils';
import {isPaidGroupPolicy} from '@libs/PolicyUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type {CompanyCardFeed, Policy} from '@src/types/onyx';
import useLocalize from './useLocalize';
import useOnyx from './useOnyx';

const eligiblePoliciesSelector = (policies: OnyxCollection<Policy>) => {
    return Object.values(policies ?? {}).reduce((policiesIDs, policy) => {
        if (isPaidGroupPolicy(policy) && policy?.areCompanyCardsEnabled) {
            policiesIDs.add(policy.id);
        }
        return policiesIDs;
    }, new Set<string>());
};

const useCardFeedsForDisplay = () => {
    const {localeCompare} = useLocalize();
    const [allFeeds] = useOnyx(ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER, {canBeMissing: true});
    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID, {canBeMissing: true});
    const [eligiblePoliciesIDs] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {
        selector: eligiblePoliciesSelector,
        canBeMissing: true,
    });

    const cardFeedsByPolicy = getCardFeedsForDisplayPerPolicy(allFeeds);

    let defaultCardFeed;
    if (eligiblePoliciesIDs) {
        // Prioritize the active policy if eligible
        if (activePolicyID && eligiblePoliciesIDs.has(activePolicyID)) {
            const policyCardFeeds = cardFeedsByPolicy[activePolicyID];
            if (policyCardFeeds?.length) {
                defaultCardFeed = policyCardFeeds.sort((a, b) => localeCompare(a.name, b.name)).at(0);
            }
        }

        if (!defaultCardFeed) {
            // If the active policy doesn't have card feeds, use the first eligible policy that does
            for (const eligiblePolicyID of eligiblePoliciesIDs) {
                const policyCardFeeds = cardFeedsByPolicy[eligiblePolicyID];
                if (policyCardFeeds?.length) {
                    defaultCardFeed = policyCardFeeds.sort((a, b) => localeCompare(a.name, b.name)).at(0);
                    break;
                }
            }
        }

        if (!defaultCardFeed) {
            // Commercial feeds don't have preferred policies, so we need to include these in the list
            const commercialFeeds = Object.values(cardFeedsByPolicy)
                .flat()
                .filter((feed) => !isCustomFeed(feed.name as CompanyCardFeed));

            defaultCardFeed = commercialFeeds.sort((a, b) => localeCompare(a.name, b.name)).at(0);
        }
    }

    return {defaultCardFeed, cardFeedsByPolicy};
};

export default useCardFeedsForDisplay;
