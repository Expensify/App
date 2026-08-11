import {filterAmexDirectParentCard, getCompanyCardFeed, getCompanyFeeds, getSelectedFeed, normalizeCardName} from '@libs/CardUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {CardList} from '@src/types/onyx';
import type Card from '@src/types/onyx/Card';
import type {AssignableCardsList} from '@src/types/onyx/Card';
import type {CardFeedsStatusByDomainID, CombinedCardFeeds, CompanyCardFeedWithDomainID, CompanyCardFeedWithNumber, CompanyFeeds} from '@src/types/onyx/CardFeeds';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

import type {ResultMetadata} from 'react-native-onyx';

import type {CombinedCardFeed} from './useCardFeeds';

import useCardFeeds from './useCardFeeds';
import useCardsList from './useCardsList';
import useOnyx from './useOnyx';

type CompanyCardEntry = {
    cardName: string;
    encryptedCardNumber: string;
    isAssigned: boolean;
    assignedCard?: Card;
};

type UseCompanyCardsProps = {
    policyID: string | undefined;
    feedName?: CompanyCardFeedWithDomainID;
};

type UseCompanyCardsResult = Partial<{
    bankName: CompanyCardFeedWithNumber;
    feedName: CompanyCardFeedWithDomainID;
    cardList: AssignableCardsList;
    assignedCards: CardList;
    companyCardEntries: CompanyCardEntry[];
    workspaceCardFeedsStatus: CardFeedsStatusByDomainID;
    allCardFeeds: CombinedCardFeeds;
    companyCardFeeds: CompanyFeeds;
    selectedFeed: CombinedCardFeed;
}> & {
    isInitiallyLoadingFeeds: boolean;
    isNoFeed: boolean;
    isFeedPending: boolean;
    isFeedAdded: boolean;

    onyxMetadata: {
        cardListMetadata: ResultMetadata;
        allCardFeedsMetadata: ResultMetadata;
        lastSelectedFeedMetadata: ResultMetadata;
    };
};

/** Card records carry an empty string where a value is missing, which neither `??` nor a destructuring default catches. */
function getPresentValue(value: string | undefined): string | undefined {
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    return value || undefined;
}

/** Comparison key for card names — feeds and card records can hold the same name with different casing. */
function getCardNameKey(cardName: string): string {
    return normalizeCardName(cardName).toLowerCase();
}

/**
 * Resolves an assigned card to its corresponding cardList entry using a cascading lookup:
 * 1. encryptedCardNumber — exact match against cardList values
 * 2. cardName — normalized name match against cardList keys
 * 3. lastFourPAN — last-4-digit suffix match (only when exactly 1 cardList entry matches)
 *
 * Only the lastFourPAN path enriches the card; the other two confirm the card is already linked.
 */
function resolveCardListEntry(card: Card, cardListEntries: Array<[string, string]>): Card {
    const {cardName} = card;
    const encryptedCardNumber = getPresentValue(card.encryptedCardNumber);
    const panSuffix = getPresentValue(card.lastFourPAN) ?? cardName;

    const isLinkedByEncrypted = encryptedCardNumber && cardListEntries.some(([, entryEncryptedCardNumber]) => entryEncryptedCardNumber === encryptedCardNumber);
    if (isLinkedByEncrypted) {
        return card;
    }

    const cardNameKey = cardName ? getCardNameKey(cardName) : undefined;
    const matchedByName = cardNameKey ? cardListEntries.find(([name]) => getCardNameKey(name) === cardNameKey) : undefined;
    if (matchedByName) {
        return {...card, encryptedCardNumber: matchedByName[1]};
    }

    if (!panSuffix) {
        return card;
    }

    const lowerCasedPanSuffix = panSuffix.toLowerCase();
    const [matchedCard, ...otherMatchedCards] = cardListEntries.filter(([name]) => name.toLowerCase().endsWith(lowerCasedPanSuffix)).slice(0, 2);

    // If there are other matched cards, return the original card.
    if (otherMatchedCards.length > 0) {
        return card;
    }

    const [name = cardName, encrypted = encryptedCardNumber] = matchedCard ?? [];
    return {...card, cardName: name, encryptedCardNumber: encrypted};
}

/**
 * Builds a list of card entries by starting from assignedCards (source of truth for assignments),
 * then filling in remaining unassigned cards from accountList/cardList.
 */
function buildCompanyCardEntries(
    accountList: string[] | undefined,
    cardList: AssignableCardsList | undefined,
    assignedCards: CardList,
    feedName?: CompanyCardFeedWithDomainID,
): CompanyCardEntry[] {
    const existingNames = new Set<string>();
    const existingEncryptedCardNumbers = new Set<string>();
    const entriesMap = new Map<string, CompanyCardEntry>();

    const cardListEntries = Object.entries(cardList ?? {});

    // Phase 1: Assigned cards first — these are the source of truth.
    // Previously assigned parent cards are kept visible so admins can manage/unassign them.
    for (const card of Object.values(assignedCards)) {
        if (!card?.cardName) {
            continue;
        }

        const resolvedCard = resolveCardListEntry(card, cardListEntries);
        const cardName = getPresentValue(resolvedCard.cardName) ?? card.cardName;
        const encryptedCardNumber = getPresentValue(resolvedCard.encryptedCardNumber) ?? getPresentValue(card.encryptedCardNumber);
        const cardNameKey = getCardNameKey(cardName);

        // Records without an encrypted number fall back to their name, otherwise they would all share one key and overwrite each other.
        const cardEntryID = encryptedCardNumber ?? cardNameKey;

        const existingEntry = entriesMap.get(cardEntryID);
        const isRicherRecord = card.lastFourPAN && !existingEntry?.assignedCard?.lastFourPAN;

        // Skip duplicate when two assigned-card records (e.g. old-format + new-format) resolve to the same cardList entry.
        if (!existingEntry || isRicherRecord) {
            entriesMap.set(cardEntryID, {cardName, encryptedCardNumber: encryptedCardNumber ?? cardName, isAssigned: true, assignedCard: card});
        }

        // Register every representation of the card, so phase 2 skips its cardList entry whichever one that entry carries.
        existingNames.add(cardNameKey);
        existingNames.add(getCardNameKey(card.cardName));
        if (encryptedCardNumber) {
            existingEncryptedCardNumbers.add(encryptedCardNumber);
        }
        const recordEncryptedCardNumber = getPresentValue(card.encryptedCardNumber);
        if (recordEncryptedCardNumber) {
            existingEncryptedCardNumbers.add(recordEncryptedCardNumber);
        }
    }

    // Phase 2: Add remaining unassigned cards. cardList first so its encryptedCardNumber takes precedence.
    for (const [cardName, entryEncryptedCardNumber] of cardListEntries) {
        const cardNameKey = getCardNameKey(cardName);
        const encryptedCardNumber = getPresentValue(entryEncryptedCardNumber);

        if (existingNames.has(cardNameKey) || (encryptedCardNumber && existingEncryptedCardNumbers.has(encryptedCardNumber))) {
            continue;
        }

        entriesMap.set(encryptedCardNumber ?? cardNameKey, {cardName, encryptedCardNumber: entryEncryptedCardNumber, isAssigned: false});
        existingNames.add(cardNameKey);
        if (encryptedCardNumber) {
            existingEncryptedCardNumbers.add(encryptedCardNumber);
        }
    }

    for (const cardName of filterAmexDirectParentCard(accountList ?? [], feedName)) {
        const cardNameKey = getCardNameKey(cardName);
        const encryptedCardNumber = cardList?.[cardName] ?? cardName;

        if (existingNames.has(cardNameKey) || existingEncryptedCardNumbers.has(encryptedCardNumber)) {
            continue;
        }

        entriesMap.set(cardNameKey, {cardName, encryptedCardNumber, isAssigned: false});
        existingNames.add(cardNameKey);
    }

    return Array.from(entriesMap.values());
}

function useCompanyCards({policyID, feedName: feedNameProp}: UseCompanyCardsProps): UseCompanyCardsResult {
    // If an empty string is passed, we need to use an invalid key to avoid fetching the whole collection.
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    const policyIDKey = policyID || CONST.DEFAULT_MISSING_ID;

    const [lastSelectedFeed, lastSelectedFeedMetadata] = useOnyx(`${ONYXKEYS.COLLECTION.LAST_SELECTED_FEED}${policyIDKey}`);
    const [allCardFeeds, allCardFeedsMetadata, , workspaceCardFeedsStatus] = useCardFeeds(policyID);

    const feedName = feedNameProp ?? getSelectedFeed(lastSelectedFeed, allCardFeeds);
    const bankName = feedName ? getCompanyCardFeed(feedName) : undefined;

    const [cardsList, cardListMetadata] = useCardsList(feedName);

    const companyCardFeeds = getCompanyFeeds(allCardFeeds);
    const selectedFeed = feedName && companyCardFeeds[feedName];

    const {cardList, ...assignedCards} = cardsList ?? {};
    const companyCardEntries = buildCompanyCardEntries(selectedFeed?.accountList, cardList, assignedCards, feedName);

    const onyxMetadata = {
        cardListMetadata,
        allCardFeedsMetadata,
        lastSelectedFeedMetadata,
    };

    const isInitiallyLoadingFeeds = isLoadingOnyxValue(allCardFeedsMetadata);
    const isNoFeed = !selectedFeed && !isInitiallyLoadingFeeds;
    const isFeedPending = !!selectedFeed?.pending;
    const isFeedAdded = !isInitiallyLoadingFeeds && !isFeedPending && !isNoFeed;

    if (!policyID) {
        return {onyxMetadata, isInitiallyLoadingFeeds, isNoFeed, isFeedPending, isFeedAdded};
    }

    return {
        allCardFeeds,
        feedName,
        companyCardFeeds,
        cardList,
        assignedCards,
        companyCardEntries,
        workspaceCardFeedsStatus,
        selectedFeed,
        bankName,
        onyxMetadata,
        isInitiallyLoadingFeeds,
        isNoFeed,
        isFeedPending,
        isFeedAdded,
    };
}

export default useCompanyCards;
export type {UseCompanyCardsResult};
