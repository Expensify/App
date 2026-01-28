import type {OnyxEntry} from 'react-native-onyx';
import {getCardFeedsForDisplay} from '@libs/CardFeedUtils';
import {isCard, isCardHiddenFromSearch, isPersonalCard} from '@libs/CardUtils';
import {filterObject} from '@libs/ObjectUtils';
import type {CardList, NonPersonalAndWorkspaceCardListDerivedValue} from '@src/types/onyx';

/**
 * Filter out cards that are hidden from search.
 * Cards are hidden if they are not virtual and have a state that is in HIDDEN_FROM_SEARCH_STATES.
 */
const filterCardsHiddenFromSearch = (cardList: OnyxEntry<CardList>): CardList => {
    const filteredCardList: CardList = {};
    for (const card of Object.values(cardList ?? {})) {
        if (!isCard(card) || isCardHiddenFromSearch(card)) {
            continue;
        }
        filteredCardList[card.cardID] = card;
    }
    return filteredCardList;
};

/**
 * Filter out personal cards from the card list.
 * Personal cards have fundID === '0' or no fundID.
 * This selector keeps non-personal cards (fundID !== '0').
 */
const filterPersonalCards = (cards: OnyxEntry<CardList>): CardList => {
    return filterObject(cards ?? {}, (key, card) => !isPersonalCard(card));
};

/**
 * Selects the Expensify Card feed from the card list and returns the first one.
 */
const defaultExpensifyCardSelector = (allCards: OnyxEntry<NonPersonalAndWorkspaceCardListDerivedValue>) => {
    const cards = getCardFeedsForDisplay({}, allCards);
    return Object.values(cards)?.at(0);
};

export {filterCardsHiddenFromSearch, filterPersonalCards, defaultExpensifyCardSelector};
