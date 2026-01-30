import type {OnyxEntry} from 'react-native-onyx';
import {getCardFeedsForDisplay} from '@libs/CardFeedUtils';
import {isCard, isCardHiddenFromSearch, isCardPendingActivate, isCardPendingIssue, isPersonalCard} from '@libs/CardUtils';
import {filterObject} from '@libs/ObjectUtils';
import CONST from '@src/CONST';
import type {Card, CardList, NonPersonalAndWorkspaceCardListDerivedValue} from '@src/types/onyx';

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
const filterOutPersonalCards = (cards: OnyxEntry<CardList>): CardList => {
    return filterObject(cards ?? {}, (key, card) => !isPersonalCard(card));
};

/**
 * Selects the Expensify Card feed from the card list and returns the first one.
 */
const defaultExpensifyCardSelector = (allCards: OnyxEntry<NonPersonalAndWorkspaceCardListDerivedValue>) => {
    const cards = getCardFeedsForDisplay({}, allCards);
    return Object.values(cards)?.at(0);
};

/**
 * Returns a selector that picks a single card from the card list by card ID.
 */
const cardByIdSelector = (cardID: string) => (cardList: OnyxEntry<CardList>) => cardList?.[cardID];

type TimeSensitiveCardsResult = {
    cardsNeedingShippingAddress: Card[];
    cardsNeedingActivation: Card[];
};

/**
 * Selector that filters cards to find physical Expensify cards that need shipping address or activation.
 * Returns two arrays: cards pending issue (need shipping) and cards pending activation.
 */
const timeSensitiveCardsSelector = (cards: OnyxEntry<CardList>): TimeSensitiveCardsResult => {
    const result: TimeSensitiveCardsResult = {
        cardsNeedingShippingAddress: [],
        cardsNeedingActivation: [],
    };

    for (const card of Object.values(cards ?? {})) {
        if (!isCard(card)) {
            continue;
        }

        // Only consider physical Expensify cards
        const isPhysicalExpensifyCard = card.bank === CONST.EXPENSIFY_CARD.BANK && !card.nameValuePairs?.isVirtual;
        if (!isPhysicalExpensifyCard) {
            continue;
        }

        if (isCardPendingIssue(card)) {
            result.cardsNeedingShippingAddress.push(card);
        }

        if (isCardPendingActivate(card)) {
            result.cardsNeedingActivation.push(card);
        }
    }

    return result;
};

export {filterCardsHiddenFromSearch, filterOutPersonalCards, defaultExpensifyCardSelector, cardByIdSelector, timeSensitiveCardsSelector};
export type {TimeSensitiveCardsResult};
