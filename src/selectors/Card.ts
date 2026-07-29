import {getExpensifyCardFeedsForDisplay} from '@libs/CardFeedUtils';
import {hasAssignedCardMatching, isActiveCard, isCard, isCardHiddenFromSearch, isCSVFeedOrExpensifyCard, isExpensifyCard, isPersonalCard} from '@libs/CardUtils';
import {filterObject} from '@libs/ObjectUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {CardFeeds, CardList, NonPersonalAndWorkspaceCardListDerivedValue, WorkspaceCardsList} from '@src/types/onyx';

import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';

/**
 * Builds a lightweight map of "${domainID}_${feedName}" keys that have card entries.
 * A feed counts as having cards when:
 * - it has at least one assigned card object, OR
 * - it is a CSV feed, and it has at least one entry in `cardList`.
 *
 * Input key format: "cards_${domainID}_${feedName}" (e.g., "cards_12345_oauth.chase.com")
 * Output key format: "${domainID}_${feedName}" (e.g., "12345_oauth.chase.com")
 */
const buildFeedKeysWithAssignedCards = (allWorkspaceCards: OnyxCollection<WorkspaceCardsList>): Record<string, true> => {
    const result: Record<string, true> = {};

    for (const [key, cards] of Object.entries(allWorkspaceCards ?? {})) {
        if (!cards || typeof cards !== 'object') {
            continue;
        }

        const feedKey = key.replace(ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST, '');
        const cardFeedName = feedKey.split('_').slice(1).join('_');
        const hasAssignedCards = Object.keys(cards).some((k) => k !== 'cardList');
        const isCSVFeed = isCSVFeedOrExpensifyCard(cardFeedName);
        const hasCardsToAssign = isCSVFeed && Object.keys(cards.cardList ?? {}).length > 0;
        if (hasAssignedCards || hasCardsToAssign) {
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
 * Get only personal cards from the card list.
 */
const getBankLinkedPersonalCards = (cards: OnyxEntry<CardList>): CardList => {
    return filterObject(
        cards ?? {},
        (key, card) => !!card && card.cardName !== CONST.COMPANY_CARDS.CARD_NAME.CASH && card.bank !== CONST.PERSONAL_CARDS.BANK_NAME.CSV && (!card.fundID || card.fundID === '0'),
    );
};

/**
 * Selects the Expensify Card feed from the card list and returns the first regular (non-travel) one.
 */
const defaultExpensifyCardSelector = (allCards: OnyxEntry<NonPersonalAndWorkspaceCardListDerivedValue>) => {
    const cards = Object.values(getExpensifyCardFeedsForDisplay(allCards ?? undefined, undefined));
    return cards.find((feed) => feed.country !== CONST.TRAVEL.PROGRAM_TRAVEL_US);
};

/**
 * Returns a selector that picks a single card from the card list by card ID.
 */
const cardByIdSelector = (cardID: string) => (cardList: OnyxEntry<CardList>) => cardList?.[cardID];

/**
 * Checks if all Expensify cards have been shipped (state is not STATE_NOT_ISSUED).
 * Only considers valid Expensify cards - ignores personal cards, company cards, and invalid entries.
 * Returns true if there are no Expensify cards pending issue, or if there are no Expensify cards at all.
 */
const areAllExpensifyCardsShipped = (cardList: OnyxEntry<CardList>): boolean =>
    Object.values(cardList ?? {})
        .filter((card) => isCard(card) && isExpensifyCard(card))
        .every((card) => card.state !== CONST.EXPENSIFY_CARD.STATE.STATE_NOT_ISSUED);

const isExpensifyCardContinuousReconciliationEnabledSelector = (value: boolean | string | undefined): boolean | undefined => {
    return typeof value === 'string' ? value === '1' : value;
};

/** Picks the shared company card custom names from a domain's card feeds, avoiding a subscription to the entire CardFeeds object. */
const companyCardCustomNamesSelector = (cardFeeds: OnyxEntry<CardFeeds>) => cardFeeds?.settings?.companyCardCustomNames;

/**
 * Determines whether a workspace has at least one active Expensify Card.
 * Intended to run against a single WorkspaceCardsList entry subscribed by its exact
 * `cards_${workspaceAccountID}_${CONST.EXPENSIFY_CARD.BANK}` key. It drops the `cardList` of cards still available to
 * assign and any inactive cards, then checks whether an active Expensify Card remains. Reducing to a boolean in the
 * selector keeps consumers from re-rendering on unrelated card changes.
 */
const hasIssuedExpensifyCardSelector = (cardsList: OnyxEntry<WorkspaceCardsList>): boolean =>
    hasAssignedCardMatching(cardsList, (card) => card.bank === CONST.EXPENSIFY_CARD.BANK && isActiveCard(card));

export {
    filterCardsHiddenFromSearch,
    filterOutPersonalCards,
    defaultExpensifyCardSelector,
    cardByIdSelector,
    areAllExpensifyCardsShipped,
    buildFeedKeysWithAssignedCards,
    getBankLinkedPersonalCards,
    isExpensifyCardContinuousReconciliationEnabledSelector,
    companyCardCustomNamesSelector,
    hasIssuedExpensifyCardSelector,
};
