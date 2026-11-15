import {getPreferredPolicyFromExpensifyCardSettings} from '@libs/CardUtils';
import type {ExpensifyCardFeedEntry} from '@libs/ExpensifyCardFeedSelectorUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Card} from '@src/types/onyx';

import useCardFeedsForDisplay from './useCardFeedsForDisplay';
import useCardsLists from './useCardsLists';
import useExpensifyCardFeedsForFeedSelector from './useExpensifyCardFeedsForFeedSelector';
import useLoadSearchCardData from './useLoadSearchCardData';
import useWorkspaceAccountID from './useWorkspaceAccountID';

type PolicyCards = {
    /** The cards the workspace's own feeds hold */
    cards: Card[];

    /** Whether the cards are still on their way, which is not the same as the workspace having none */
    isLoadingCards: boolean;
};

/**
 * Every Expensify Card feed a rule on this workspace can match on, by the three routes a workspace reaches a feed:
 * `linkedPolicyIDs`, the OldDot-only `preferredPolicy`, and a domain fund that backs the workspace account directly.
 *
 * `getActiveExpensifyCardFeedID` walks the same three in precedence order to settle on one feed. All three are
 * kept here instead, because a workspace can be linked to several feeds at once and a card from any of them is
 * one the rule can match.
 */
function getPolicyExpensifyCardFeeds(
    policyID: string | undefined,
    primaryFeeds: ExpensifyCardFeedEntry[],
    allFeeds: ExpensifyCardFeedEntry[],
    workspaceAccountID: number,
): ExpensifyCardFeedEntry[] {
    const linkedFundIDs = new Set(primaryFeeds.map((feed) => feed.fundID));
    return allFeeds.filter(
        (feed) =>
            linkedFundIDs.has(feed.fundID) ||
            (!!workspaceAccountID && feed.fundID === workspaceAccountID) ||
            (!!policyID && getPreferredPolicyFromExpensifyCardSettings(feed.settings)?.toUpperCase() === policyID.toUpperCase()),
    );
}

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
    // `cardFeedsByPolicy` is built from the domain member NVP, which holds company card feeds only, so the
    // workspace's Expensify Card feeds have to be resolved from the card settings collection separately.
    const {primaryFeeds, allFeeds: expensifyCardFeeds} = useExpensifyCardFeedsForFeedSelector(policyID);

    const policyFeedKeys = new Set<string>();
    for (const feed of (policyID ? cardFeedsByPolicy[policyID] : undefined) ?? []) {
        policyFeedKeys.add(feed.id);
    }
    for (const feed of getPolicyExpensifyCardFeeds(policyID, primaryFeeds, expensifyCardFeeds, workspaceAccountID)) {
        policyFeedKeys.add(`${feed.fundID}_${CONST.EXPENSIFY_CARD.BANK}`);
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
