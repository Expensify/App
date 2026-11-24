import {getCardDescriptionForSearchTable} from '@libs/CardUtils';
import {temporaryGetDisplayNameOrDefault} from '@libs/PersonalDetailsUtils';

import CONST from '@src/CONST';

import useCardsLists from './useCardsLists';
import useLoadSearchCardData from './useLoadSearchCardData';
import useLocalize from './useLocalize';
import {useAllPersonalDetails} from './usePersonalDetails';

/**
 * The names an expense default rule's card conditions read as, keyed by card ID.
 *
 * A rule stores card IDs, and a rule copied to another workspace names cards that workspace never had, so every
 * card this account can see is read rather than only the ones the workspace owns.
 *
 * Onyx opens with a subset of the cards, so they are asked for here unless the caller already has a loader of its
 * own. Each copy of the loader keeps its own flag, so two of them on one page send the request twice.
 *
 * `areCardsLoaded` separates a card that is gone from one that has not arrived yet, so a caller does not name a
 * real card as deleted while the request is still out.
 */
function useExpenseDefaultCardNames(shouldLoadCards = true): {cards: Record<string, string>; areCardsLoaded: boolean} {
    const {translate, formatPhoneNumber} = useLocalize();
    const [allPersonalDetails] = useAllPersonalDetails();
    const {areCardsLoaded} = useLoadSearchCardData(shouldLoadCards);
    const [cardsLists, cardsListsMetadata] = useCardsLists();

    const cards: Record<string, string> = {};
    for (const cardsList of Object.values(cardsLists ?? {})) {
        // `cardList` sits alongside the cards as the feed's plan metadata rather than as a card of its own.
        const {cardList, ...feedCards} = cardsList ?? {};
        for (const card of Object.values(feedCards)) {
            // Two cards of the same feed read alike until the cardholder names them apart, which is how the spend
            // rules name a card too.
            const cardholderName = temporaryGetDisplayNameOrDefault({
                passedPersonalDetails: allPersonalDetails?.[card.accountID ?? CONST.DEFAULT_NUMBER_ID],
                defaultValue: '',
                shouldFallbackToHidden: false,
                translate,
                formatPhoneNumber,
            });
            cards[String(card.cardID)] = getCardDescriptionForSearchTable(card, translate, cardholderName || undefined);
        }
    }

    return {cards, areCardsLoaded: areCardsLoaded && cardsListsMetadata.status === 'loaded'};
}

export default useExpenseDefaultCardNames;
