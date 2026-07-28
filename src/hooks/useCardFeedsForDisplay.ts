import type {CardFeedForDisplay} from '@libs/CardFeedUtils';
import {getCardFeedsForDisplayPerPolicy} from '@libs/CardFeedUtils';
import {getPreferredPolicyFromExpensifyCardSettings, isCustomFeed} from '@libs/CardUtils';
import {isPaidGroupPolicy} from '@libs/PolicyUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy} from '@src/types/onyx';
import type {CardFeedWithNumber} from '@src/types/onyx/CardFeeds';

import type {OnyxCollection} from 'react-native-onyx';

import {expensifyCardFeedsForDisplaySelector} from '@selectors/Card';

import useExpensifyCardFeedsForFeedSelector from './useExpensifyCardFeedsForFeedSelector';
import useFeedKeysWithAssignedCards from './useFeedKeysWithAssignedCards';
import useLocalize from './useLocalize';
import useOnyx from './useOnyx';

const eligiblePoliciesSelector = (policies: OnyxCollection<Policy>): string[] => {
    return Object.values(policies ?? {}).reduce((policiesIDs, policy) => {
        if (isPaidGroupPolicy(policy) && policy?.areCompanyCardsEnabled && policy?.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE) {
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
    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const feedKeysWithCards = useFeedKeysWithAssignedCards();
    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID);
    const [expensifyCardFeeds] = useOnyx(ONYXKEYS.DERIVED.NON_PERSONAL_AND_WORKSPACE_CARD_LIST, {selector: expensifyCardFeedsForDisplaySelector});
    const eligiblePoliciesIDsArray = eligiblePoliciesSelector(allPolicies);

    const cardFeedsByPolicy = getCardFeedsForDisplayPerPolicy(allFeeds, translate, feedKeysWithCards, allPolicies);

    const defaultCardFeed = getDefaultCardFeed(eligiblePoliciesIDsArray, activePolicyID, cardFeedsByPolicy, localeCompare);

    // Resolve the active workspace's Expensify Card feed the same way existing flows do (see `useDefaultFundID`),
    // scoping to the active policy so we don't pull in a feed from another workspace the user also belongs to.
    const {primaryFeeds, allFeeds: expensifyCardFeedEntries} = useExpensifyCardFeedsForFeedSelector(activePolicyID);
    const activePolicy = activePolicyID ? allPolicies?.[`${ONYXKEYS.COLLECTION.POLICY}${activePolicyID}`] : undefined;
    const activePolicyAccountID = activePolicy?.policyAccountID;
    const preferredPolicyFeedFundID = activePolicyID
        ? expensifyCardFeedEntries.find((entry) => getPreferredPolicyFromExpensifyCardSettings(entry.settings)?.toUpperCase() === activePolicyID.toUpperCase())?.fundID
        : undefined;

    // Only override the default when the active workspace is itself eligible for Card accruals. Tab visibility is
    // OR-ed across workspaces, so without this gate an ineligible active workspace's card could hijack the feed.
    const isActivePolicyEligibleForCardAccruals =
        isPaidGroupPolicy(activePolicy) &&
        (activePolicy?.role === CONST.POLICY.ROLE.ADMIN || activePolicy?.role === CONST.POLICY.ROLE.AUDITOR) &&
        (activePolicy?.approvalMode ? activePolicy.approvalMode !== CONST.POLICY.APPROVAL_MODE.OPTIONAL : false);

    const activeExpensifyCardFeedID = isActivePolicyEligibleForCardAccruals
        ? [primaryFeeds.at(0)?.fundID, preferredPolicyFeedFundID, activePolicyAccountID]
              .filter((fundID): fundID is number => fundID != null)
              .map((fundID) => expensifyCardFeeds?.find((feed) => feed.fundID === String(fundID))?.id)
              .find((feedID) => !!feedID)
        : undefined;

    return {defaultCardFeed, cardFeedsByPolicy, activeExpensifyCardFeedID};
};

export default useCardFeedsForDisplay;
export {getDefaultCardFeed};
