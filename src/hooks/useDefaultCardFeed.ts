import {useMemo} from 'react';
import {getCardFeedsForDisplayPerPolicy} from '@libs/CardFeedUtils';
import {getActivePolicy, isPaidGroupPolicy} from '@libs/PolicyUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import useOnyx from './useOnyx';

const useDefaultCardFeed = () => {
    const [allFeeds] = useOnyx(ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER, {canBeMissing: true});
    const [eligiblePolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {
        canBeMissing: false,
        selector: (policies) => {
            const activePolicy = getActivePolicy();
            const policyList = [activePolicy, ...Object.values(policies ?? {})];

            return policyList.filter((policy) => {
                return isPaidGroupPolicy(policy) && policy?.areCompanyCardsEnabled && policy.role === CONST.POLICY.ROLE.ADMIN;
            });
        },
    });

    const defaultCardFeed = useMemo(() => {
        const cardFeedsForDisplayPerPolicy = getCardFeedsForDisplayPerPolicy(allFeeds);

        if (!eligiblePolicies?.length) {
            return undefined;
        }

        for (const policy of eligiblePolicies) {
            if (policy) {
                const policyCardFeeds = cardFeedsForDisplayPerPolicy[policy.id];

                if (policyCardFeeds?.length) {
                    return policyCardFeeds.sort((a, b) => a.name.localeCompare(b.name)).at(0)?.id;
                }
            }
        }
    }, [allFeeds, eligiblePolicies]);

    return defaultCardFeed;
};

export default useDefaultCardFeed;
