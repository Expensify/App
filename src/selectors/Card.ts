import type {OnyxEntry} from 'react-native-onyx';
import type {LocalizedTranslate} from '@components/LocaleContextProvider';
import {getCardFeedsForDisplay} from '@libs/CardFeedUtils';
import {isCard, isCardHiddenFromSearch, isCardPendingActivate, isCardPendingIssue, isCardWithPotentialFraud, isExpensifyCard, isPersonalCard} from '@libs/CardUtils';
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
const defaultExpensifyCardSelector = (allCards: OnyxEntry<NonPersonalAndWorkspaceCardListDerivedValue>, translate: LocalizedTranslate) => {
    const cards = getCardFeedsForDisplay({}, allCards, translate);
    return Object.values(cards)?.at(0);
};

/**
 * Returns a selector that picks a single card from the card list by card ID.
 */
const cardByIdSelector = (cardID: string) => (cardList: OnyxEntry<CardList>) => cardList?.[cardID];

type TimeSensitiveCardsResult = {
    cardsNeedingShippingAddress: Card[];
    cardsNeedingActivation: Card[];
    cardsWithFraud: Card[];
};

/**
 * Selector that filters cards to find Expensify cards that need time-sensitive action.
 * Returns arrays for: cards with potential fraud, cards pending issue (need shipping), and cards pending activation.
 */
const timeSensitiveCardsSelector = (cards: OnyxEntry<CardList>): TimeSensitiveCardsResult => {
    const result: TimeSensitiveCardsResult = {
        cardsNeedingShippingAddress: [],
        cardsNeedingActivation: [],
        cardsWithFraud: [],
    };

    for (const card of Object.values(cards ?? {})) {
        if (!isCard(card)) {
            continue;
        }

        // Only consider Expensify cards
        if (!isExpensifyCard(card)) {
            continue;
        }

        // Check for fraud on any Expensify card (physical or virtual)
        if (isCardWithPotentialFraud(card)) {
            result.cardsWithFraud.push(card);
        }

        // Physical card checks (shipping address and activation)
        const isPhysicalCard = !card.nameValuePairs?.isVirtual;
        if (!isPhysicalCard) {
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

/**
 * Checks if all Expensify cards have been shipped (state is not STATE_NOT_ISSUED).
 * Only considers valid Expensify cards - ignores personal cards, company cards, and invalid entries.
 * Returns true if there are no Expensify cards pending issue, or if there are no Expensify cards at all.
 */
const areAllExpensifyCardsShipped = (cardList: OnyxEntry<CardList>): boolean =>
    Object.values(cardList ?? {})
        .filter((card) => isCard(card) && isExpensifyCard(card))
        .every((card) => card.state !== CONST.EXPENSIFY_CARD.STATE.STATE_NOT_ISSUED);

export {filterCardsHiddenFromSearch, filterOutPersonalCards, defaultExpensifyCardSelector, cardByIdSelector, timeSensitiveCardsSelector, areAllExpensifyCardsShipped};
export type {TimeSensitiveCardsResult};
