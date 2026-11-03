import useCardFeedsForDisplay from '@hooks/useCardFeedsForDisplay';
import useCardsLists from '@hooks/useCardsLists';
import useDefaultFundID from '@hooks/useDefaultFundID';

import ONYXKEYS from '@src/ONYXKEYS';
import type {Card} from '@src/types/onyx';

/**
 * The cards a rule on this workspace can match on, across its Expensify Card and company card feeds.
 *
 * A rule only ever runs against one workspace, so a card from another workspace the admin belongs to would
 * produce a rule that can never match. Cards are therefore keyed back to the funds the workspace owns rather
 * than read from the whole `cards_` collection the way the search filter does.
 */
function usePolicyCards(policyID: string | undefined): Card[] {
    const [cardsLists] = useCardsLists();
    const defaultFundID = useDefaultFundID(policyID);
    const {cardFeedsByPolicy} = useCardFeedsForDisplay();

    const policyFundIDs = new Set<string>([String(defaultFundID)]);
    for (const feed of (policyID ? cardFeedsByPolicy[policyID] : undefined) ?? []) {
        policyFundIDs.add(feed.fundID);
    }

    const cards: Card[] = [];
    for (const [key, cardsList] of Object.entries(cardsLists ?? {})) {
        // `cards_<fundID>_<feedName>`, where the feed name itself may hold underscores.
        const fundID = key.slice(ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST.length).split('_').at(0);
        if (!fundID || !policyFundIDs.has(fundID)) {
            continue;
        }
        // `cardList` sits alongside the cards as the feed's plan metadata rather than as a card of its own.
        const {cardList, ...feedCards} = cardsList ?? {};
        cards.push(...Object.values(feedCards));
    }

    return cards;
}

export default usePolicyCards;
