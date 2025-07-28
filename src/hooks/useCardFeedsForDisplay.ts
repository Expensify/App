import {useMemo} from 'react';
import {getCardFeedsForDisplayPerPolicy} from '@libs/CardFeedUtils';
import {isPaidGroupPolicy} from '@libs/PolicyUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import useLocalize from './useLocalize';
import useOnyx from './useOnyx';

const useCardFeedsForDisplay = () => {
    const {localeCompare} = useLocalize();
    const [allFeeds] = useOnyx(ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER, {canBeMissing: true});
    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID, {canBeMissing: true});
    const [eligiblePoliciesIDs] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {
        selector: (policies) => {
            return Object.values(policies ?? {}).reduce((policiesIDs, policy) => {
                if (isPaidGroupPolicy(policy) && policy?.areCompanyCardsEnabled) {
                    policiesIDs.add(policy.id);
                }
                return policiesIDs;
            }, new Set<string>());
        },
        canBeMissing: true,
    });

    const cardFeedsByPolicy = useMemo(() => getCardFeedsForDisplayPerPolicy(allFeeds), [allFeeds]);

    const defaultCardFeed = useMemo(() => {
        if (!eligiblePoliciesIDs) {
            return undefined;
        }

        // Prioritize the active policy if eligible
        if (activePolicyID && eligiblePoliciesIDs.has(activePolicyID)) {
            const policyCardFeeds = cardFeedsByPolicy[activePolicyID];
            if (policyCardFeeds?.length) {
                return policyCardFeeds.sort((a, b) => localeCompare(a.name, b.name)).at(0);
            }
        }

        // If the active policy doesn't have card feeds, use the first eligible policy that does
        for (const eligiblePolicyID of eligiblePoliciesIDs) {
            const policyCardFeeds = cardFeedsByPolicy[eligiblePolicyID];
            if (policyCardFeeds?.length) {
                return policyCardFeeds.sort((a, b) => localeCompare(a.name, b.name)).at(0);
            }
        }
    }, [eligiblePoliciesIDs, activePolicyID, cardFeedsByPolicy, localeCompare]);

    return {defaultCardFeed, cardFeedsByPolicy};
};

export default useCardFeedsForDisplay;
