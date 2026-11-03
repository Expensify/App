import useCardFeedsForDisplay from '@hooks/useCardFeedsForDisplay';
import useCardsLists from '@hooks/useCardsLists';
import useDefaultFundID from '@hooks/useDefaultFundID';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Card} from '@src/types/onyx';

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
function usePolicyCards(policyID: string | undefined): Card[] {
    const [cardsLists] = useCardsLists();
    const defaultFundID = useDefaultFundID(policyID);
    const {cardFeedsByPolicy} = useCardFeedsForDisplay();

    const policyFeedKeys = new Set<string>([`${defaultFundID}_${CONST.EXPENSIFY_CARD.BANK}`]);
    for (const feed of (policyID ? cardFeedsByPolicy[policyID] : undefined) ?? []) {
        policyFeedKeys.add(feed.id);
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

    return cards;
}

export default usePolicyCards;
