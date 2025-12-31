import {useMemo} from 'react';
import type {OnyxCollection} from 'react-native-onyx';
import {getCardFeedsForDisplay, getCardFeedsForDisplayPerPolicy} from '@libs/CardFeedUtils';
import {filterPersonalCards, isCustomFeed, mergeCardListWithWorkspaceFeeds} from '@libs/CardUtils';
import {isPaidGroupPolicy} from '@libs/PolicyUtils';
import CONST from '@src/CONST';
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

        // Commercial feeds don't have preferred policies, so we need to include these in the list
        const commercialFeeds = Object.values(cardFeedsByPolicy)
            .flat()
            .filter((feed) => !isCustomFeed(feed.name as CompanyCardFeed));

        return commercialFeeds.sort((a, b) => localeCompare(a.name, b.name)).at(0);
    }, [eligiblePoliciesIDs, activePolicyID, cardFeedsByPolicy, localeCompare]);

    const [userCardList] = useOnyx(ONYXKEYS.CARD_LIST, {selector: filterPersonalCards, canBeMissing: true});
    const [workspaceCardFeeds] = useOnyx(ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST, {canBeMissing: true});
    const allCards = useMemo(() => mergeCardListWithWorkspaceFeeds(workspaceCardFeeds ?? CONST.EMPTY_OBJECT, userCardList), [userCardList, workspaceCardFeeds]);
    const expensifyCards = getCardFeedsForDisplay({}, allCards);
    const defaultExpensifyCard = Object.values(expensifyCards)?.at(0);

    return {defaultCardFeed, cardFeedsByPolicy, defaultExpensifyCard};
};

export default useCardFeedsForDisplay;
