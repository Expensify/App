import type {OnyxCollection, OnyxEntry, ResultMetadata} from 'react-native-onyx';
import {getCompanyCardFeed, getCompanyFeeds, getSelectedFeed, normalizeCardName} from '@libs/CardUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {CardFeeds, CardList} from '@src/types/onyx';
import type Card from '@src/types/onyx/Card';
import type {AssignableCardsList, WorkspaceCardsList} from '@src/types/onyx/Card';
import type {CardFeedsStatusByDomainID, CombinedCardFeeds, CompanyCardFeedWithDomainID, CompanyCardFeedWithNumber, CompanyFeeds} from '@src/types/onyx/CardFeeds';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';
import useCardFeeds from './useCardFeeds';
import type {CombinedCardFeed} from './useCardFeeds';
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
        cardListMetadata: ResultMetadata<WorkspaceCardsList>;
        allCardFeedsMetadata: ResultMetadata<OnyxCollection<CardFeeds>>;
        lastSelectedFeedMetadata: ResultMetadata<OnyxEntry<CompanyCardFeedWithDomainID>>;
    };
};

/**
 * Resolves an assigned card to its corresponding cardList entry using a cascading lookup:
 * 1. encryptedCardNumber — exact match against cardList values
 * 2. cardName — normalized name match against cardList keys
 * 3. lastFourPAN — last-4-digit suffix match (only when exactly 1 cardList entry matches)
 *
 * Only the lastFourPAN path enriches the card; the other two confirm the card is already linked.
 */
function resolveCardListEntry(card: Card, cardListEntries: Array<[string, string]>): Card {
    if (!card.lastFourPAN) {
        return card;
    }

    const {cardName, encryptedCardNumber, lastFourPAN} = card;

    const isLinkedByEncrypted = encryptedCardNumber && cardListEntries.some(([, entryEncryptedCardNumber]) => entryEncryptedCardNumber === encryptedCardNumber);
    const normalizedCardName = cardName ? normalizeCardName(cardName) : undefined;
    const isLinkedByName = normalizedCardName && cardListEntries.some(([name]) => normalizeCardName(name) === normalizedCardName);

    if (isLinkedByEncrypted || isLinkedByName) {
        return card;
    }

    const [matchedCard, ...otherMatchedCards] = cardListEntries.filter(([name]) => name.endsWith(lastFourPAN)).slice(0, 2);

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
function buildCompanyCardEntries(accountList: string[] | undefined, cardList: AssignableCardsList | undefined, assignedCards: CardList): CompanyCardEntry[] {
    const entries: CompanyCardEntry[] = [];
    const coveredNames = new Set<string>();
    const coveredEncrypted = new Set<string>();

    const cardListEntries = Object.entries(cardList ?? {});

    // Phase 1: Assigned cards first — these are the source of truth.
    for (const card of Object.values(assignedCards)) {
        if (!card?.cardName) {
            continue;
        }

        const resolved = resolveCardListEntry(card, cardListEntries);
        const {cardName = card.cardName, encryptedCardNumber = card.cardName} = resolved;

        entries.push({cardName, encryptedCardNumber, isAssigned: true, assignedCard: card});
        coveredNames.add(normalizeCardName(cardName));
        if (encryptedCardNumber !== cardName) {
            coveredEncrypted.add(encryptedCardNumber);
        }
    }

    // Phase 2: Add remaining unassigned cards. cardList first so its encryptedCardNumber takes precedence.
    for (const [name, encryptedCardNumber] of cardListEntries) {
        if (coveredNames.has(normalizeCardName(name)) || coveredEncrypted.has(encryptedCardNumber)) {
            continue;
        }
        entries.push({cardName: name, encryptedCardNumber, isAssigned: false});
        coveredNames.add(normalizeCardName(name));
        coveredEncrypted.add(encryptedCardNumber);
    }

    for (const name of accountList ?? []) {
        if (coveredNames.has(normalizeCardName(name))) {
            continue;
        }
        entries.push({cardName: name, encryptedCardNumber: name, isAssigned: false});
        coveredNames.add(normalizeCardName(name));
    }

    return entries;
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
    const companyCardEntries = buildCompanyCardEntries(selectedFeed?.accountList, cardList, assignedCards);

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
export type {CompanyCardEntry, UseCompanyCardsResult};
