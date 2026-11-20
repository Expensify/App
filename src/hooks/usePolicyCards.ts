import {getFundIdFromSettingsKey, getPolicyLinkedExpensifyCardFeedIDs} from '@libs/CardUtils';
import {getTravelBillingFeedID} from '@libs/TravelBillingUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Card, ExpensifyCardSettings} from '@src/types/onyx';

import type {OnyxCollection} from 'react-native-onyx';

import useCardFeedsForDisplay from './useCardFeedsForDisplay';
import useCardsLists from './useCardsLists';
import useLoadSearchCardData from './useLoadSearchCardData';
import useOnyx from './useOnyx';
import useWorkspaceAccountID from './useWorkspaceAccountID';

type PolicyCards = {
    /** The cards the workspace's own feeds hold */
    cards: Card[];

    /** Whether the cards are still on their way, which is not the same as the workspace having none */
    isLoadingCards: boolean;
};

/**
 * The cards a rule on this workspace can match on, across its Expensify Card and company card feeds.
 *
 * A rule only ever runs against one workspace, so a card from another workspace the admin belongs to would
 * produce a rule that can never match. Cards are therefore keyed back to the feeds the workspace owns rather
 * than read from the whole `cards_` collection the way the search filter does.
 *
 * The feeds are matched on the whole `<fundID>_<feedName>` key rather than on the fund, because one domain fund
 * holds a feed per workspace it serves and each is listed only under the workspace it is linked to.
 */
function usePolicyCards(policyID: string | undefined): PolicyCards {
    // Onyx opens with only a subset of the cards, and the per feed loaders each need a feed, an account ID and a
    // member list, so reaching this page without passing a card page would otherwise leave nothing to pick from.
    // This asks for every card the admin administers in one call, which the feed keys below narrow back down.
    const {isLoadingInitialCards} = useLoadSearchCardData();
    const [cardsLists] = useCardsLists();
    const {cardFeedsByPolicy} = useCardFeedsForDisplay();
    const workspaceAccountID = useWorkspaceAccountID(policyID);

    // Every Expensify Card feed this workspace reaches, by the three routes a workspace is tied to one:
    // `linkedPolicyIDs`, the OldDot-only `preferredPolicy`, and a fund that backs the workspace account directly.
    // `useDefaultFundID` walks the same three in precedence order to settle on a single fund, which is too narrow
    // here, because a workspace can be linked to several feeds at once and a card from any of them is one the rule
    // can match.
    const getPolicyExpensifyCardFeedIDs = (cardSettings: OnyxCollection<ExpensifyCardSettings>) => {
        const feedIDs: string[] = [];
        for (const [key, settings] of Object.entries(cardSettings ?? {})) {
            if (!settings || settings.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE) {
                continue;
            }
            const fundID = getFundIdFromSettingsKey(key);
            // A fund backing the workspace account is the workspace's own, so each of its programs is in reach.
            if (!!workspaceAccountID && fundID === workspaceAccountID) {
                feedIDs.push(`${fundID}_${CONST.EXPENSIFY_CARD.BANK}`, getTravelBillingFeedID(fundID));
                continue;
            }
            if (!policyID) {
                continue;
            }
            feedIDs.push(...getPolicyLinkedExpensifyCardFeedIDs(settings, String(fundID), policyID));
        }
        return feedIDs;
    };

    // `cardFeedsByPolicy` is built from the domain member NVP, which holds company card feeds only, so the
    // workspace's Expensify Card feeds have to be resolved from the card settings collection separately.
    const [expensifyCardFeedIDs] = useOnyx(ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS, {selector: getPolicyExpensifyCardFeedIDs});

    const policyFeedKeys = new Set<string>();
    for (const feed of (policyID ? cardFeedsByPolicy[policyID] : undefined) ?? []) {
        policyFeedKeys.add(feed.id);
    }
    for (const feedID of expensifyCardFeedIDs ?? []) {
        policyFeedKeys.add(feedID);
    }

    const cards: Card[] = [];
    for (const [key, cardsList] of Object.entries(cardsLists ?? {})) {
        if (!policyFeedKeys.has(key.slice(ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST.length))) {
            continue;
        }
        // `cardList` sits alongside the cards as the feed's plan metadata rather than as a card of its own.
        const {cardList, ...feedCards} = cardsList ?? {};
        cards.push(...Object.values(feedCards));
    }

    return {cards, isLoadingCards: isLoadingInitialCards};
}

export default usePolicyCards;
