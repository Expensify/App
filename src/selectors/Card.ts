import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import type {LocalizedTranslate} from '@components/LocaleContextProvider';
import {getCardFeedsForDisplay} from '@libs/CardFeedUtils';
import {isCard, isCardHiddenFromSearch, isCardPendingActivate, isCardPendingIssue, isCardWithPotentialFraud, isExpensifyCard, isPersonalCard} from '@libs/CardUtils';
import {filterObject} from '@libs/ObjectUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Card, CardList, NonPersonalAndWorkspaceCardListDerivedValue, WorkspaceCardsList} from '@src/types/onyx';

/**
 * Lightweight map of "${domainID}_${feedName}" keys that have at least one assigned card.
 * Used for O(1) lookup when filtering stale direct feeds, instead of passing the full WORKSPACE_CARDS_LIST collection.
 */
type FeedKeysWithAssignedCards = Record<string, true>;

/**
 * Selector that transforms the full WORKSPACE_CARDS_LIST collection into a lightweight map
 * of feed keys that have assigned cards. Only re-triggers re-renders when the set of
 * feeds-with-cards changes, not when individual card details change.
 *
 * Input key format: "cards_${domainID}_${feedName}" (e.g., "cards_12345_oauth.chase.com")
 * Output key format: "${domainID}_${feedName}" (e.g., "12345_oauth.chase.com")
 */
const feedKeysWithAssignedCardsSelector = (allWorkspaceCards: OnyxCollection<WorkspaceCardsList>): FeedKeysWithAssignedCards => {
    const result: FeedKeysWithAssignedCards = {};

    for (const [key, cards] of Object.entries(allWorkspaceCards ?? {})) {
        if (!cards || typeof cards !== 'object') {
            continue;
        }

        const {cardList, ...assignedCards} = cards;
        if (Object.keys(assignedCards).length > 0) {
            const feedKey = key.replace(ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST, '');
            result[feedKey] = true;
        }
    }

    return result;
};

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

        // Check for fraud on any Expensify card (physical or virtual).
        // Only include cards that have complete possibleFraud data with a valid fraudAlertReportID,
        // since without these the ReviewCardFraud widget cannot render anything meaningful.
        if (isCardWithPotentialFraud(card) && card.nameValuePairs?.possibleFraud?.fraudAlertReportID) {
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

export {
    filterCardsHiddenFromSearch,
    filterOutPersonalCards,
    defaultExpensifyCardSelector,
    cardByIdSelector,
    timeSensitiveCardsSelector,
    areAllExpensifyCardsShipped,
    feedKeysWithAssignedCardsSelector,
};
export type {TimeSensitiveCardsResult, FeedKeysWithAssignedCards};
