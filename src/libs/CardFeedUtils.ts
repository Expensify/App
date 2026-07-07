import type {LocaleContextProps, LocalizedTranslate} from '@components/LocaleContextProvider';
import type {AdditionalCardProps} from '@components/SelectionList/ListItem/CardListItem';

import type {FeedKeysWithAssignedCards} from '@hooks/useFeedKeysWithAssignedCards';

import type IllustrationsType from '@styles/theme/illustrations/types';

import CONST from '@src/CONST';
import type {CombinedCardFeeds} from '@src/hooks/useCardFeeds';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Card, CardFeeds, CardList, Domain, PersonalDetailsList, Policy, WorkspaceCardsList} from '@src/types/onyx';
import type {CardFeedsStatus, CardFeedsStatusByDomainID, CardFeedWithNumber, CombinedCardFeed} from '@src/types/onyx/CardFeeds';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

import type {OnyxCollection} from 'react-native-onyx';

import {isAdminSelector} from '@selectors/Domain';

import type {CompanyCardFeedIcons} from './CardUtils';
import type {OptionData} from './ReportUtils';

import {
    feedHasCards,
    getBankName,
    getCardFeedIcon,
    getCardFeedWithDomainID,
    getCustomOrFormattedFeedName,
    getDomainByFundID,
    getOriginalCompanyFeeds,
    getPlaidInstitutionIconUrl,
    getPlaidInstitutionId,
    isCard,
    isCardClosed,
    isCardHiddenFromSearch,
    isCSVUploadFeed,
    isCustomFeed,
    isDirectFeed,
    isPersonalCard,
} from './CardUtils';
import {getDescriptionForPolicyDomainCard, isPolicyAdmin} from './PolicyUtils';

type CardFilterItem = Partial<OptionData> & AdditionalCardProps & {isCardFeed?: boolean; correspondingCards?: string[]; cardFeedKey: string; plaidUrl?: string; keyForList: string};
type DomainFeedData = {bank: CardFeedWithNumber; domainName: string; correspondingCardIDs: string[]; fundID?: string; feedCountry?: string};
type CardFeedNamesWithType = Record<string, {name: string; type: 'domain' | 'workspace'}>;
type CardFeedData = {cardName: string; bank: CardFeedWithNumber; label?: string; type: 'domain' | 'workspace'; feedCountry?: string};
type GetCardFeedData = {
    workspaceCardFeeds: Record<string, WorkspaceCardsList | undefined> | undefined;
    translate: LocaleContextProps['translate'];
    policies: OnyxCollection<Policy>;
};
type CardFeedForDisplay = {
    id: string;
    feed: CardFeedWithNumber;
    fundID: string;
    name: string;
    country?: string;
    linkedPolicyIDs?: string[];
};
type CardFeedsForDisplay = Record<string, CardFeedForDisplay>;

function getRepeatingBanks(workspaceCardFeedsKeys: string[], domainFeedsData: Record<string, DomainFeedData>) {
    const bankFrequency: Record<string, number> = {};
    for (const key of workspaceCardFeedsKeys) {
        // Example: "cards_18755165_Expensify Card" -> "Expensify Card"
        const bankName = key.split('_').at(2);
        if (bankName) {
            bankFrequency[bankName] = (bankFrequency[bankName] || 0) + 1;
        }
    }
    for (const domainFeed of Object.values(domainFeedsData)) {
        bankFrequency[domainFeed.bank] = (bankFrequency[domainFeed.bank] || 0) + 1;
    }
    return Object.keys(bankFrequency).filter((bank) => bankFrequency[bank] > 1);
}

/**
 * @returns string with the 'cards_' part removed from the beginning
 */
function getCardFeedKey(workspaceCardFeeds: Record<string, WorkspaceCardsList | undefined> | undefined, workspaceFeedKey: string) {
    const workspaceFeed = workspaceCardFeeds ? workspaceCardFeeds[workspaceFeedKey] : undefined;
    if (!workspaceFeed) {
        return;
    }
    const representativeCard = Object.values(workspaceFeed).find((cardFeedItem) => isCard(cardFeedItem));
    if (!representativeCard) {
        return;
    }
    // Auth emits `cards_<fundID>_<bank>` for every feed, and only Travel Invoicing (Expensify Card
    // with feedCountry TRAVEL_US) gets the 3-segment `cards_<fundID>_Expensify Card_TRAVEL_US`
    // (see Auth/auth/lib/Card.cpp `buildCardsCollectionKey`). Stripping the `cards_` prefix returns
    // the exact token that `getWorkspaceCardFeedKey` re-prefixes to look the bucket back up, so the
    // round-trip holds for every bank.
    return workspaceFeedKey.startsWith(ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST) ? workspaceFeedKey.slice(ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST.length) : workspaceFeedKey;
}

/**
 * @returns string with added 'cards_' substring at the beginning
 */
function getWorkspaceCardFeedKey(cardFeedKey: string) {
    if (!cardFeedKey.startsWith(ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST)) {
        return `${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}${cardFeedKey}`;
    }
    return cardFeedKey;
}

/**
 * Resolves the display name of a linked policy when preferredPolicy differs from the current policyID.
 */
function getLinkedPolicyName(allPolicies: OnyxCollection<Policy>, preferredPolicy: string | undefined, currentPolicyID: string, fallbackName: string | undefined): string | undefined {
    if (preferredPolicy && preferredPolicy !== currentPolicyID) {
        return allPolicies?.[`${ONYXKEYS.COLLECTION.POLICY}${preferredPolicy}`]?.name ?? fallbackName;
    }
    return fallbackName;
}

function createCardFilterItem(
    card: Card,
    personalDetailsList: PersonalDetailsList,
    selectedCards: string[],
    illustrations: IllustrationsType,
    companyCardIcons: CompanyCardFeedIcons,
    customCardNames?: Record<string, string>,
): CardFilterItem {
    const personalDetails = personalDetailsList[card?.accountID ?? CONST.DEFAULT_NUMBER_ID];
    const isSelected = selectedCards.includes(card.cardID.toString());
    const icon = getCardFeedIcon(card?.bank, illustrations, companyCardIcons);
    let cardName = card?.nameValuePairs?.cardTitle;
    const text = personalDetails?.displayName ?? cardName;
    const plaidUrl = getPlaidInstitutionIconUrl(card?.bank);
    const isCSVImportCard = card?.bank === CONST.PERSONAL_CARDS.BANK_NAME.CSV;
    const isPersonal = isPersonalCard(card);
    if (isPersonal && !isCSVImportCard) {
        cardName = customCardNames?.[card?.cardID] ?? card?.cardName;
    }

    return {
        lastFourPAN: isCSVImportCard ? card?.cardName : card.lastFourPAN,
        isVirtual: card?.nameValuePairs?.isVirtual,
        shouldShowOwnersAvatar: true,
        cardName,
        cardOwnerPersonalDetails: personalDetails ?? undefined,
        text,
        plaidUrl,
        keyForList: card.cardID.toString(),
        isSelected,
        bankIcon: {
            icon,
        },
        isCardFeed: false,
        cardFeedKey: '',
    };
}

function buildCardsData(
    workspaceCardFeeds: Record<string, WorkspaceCardsList | undefined>,
    userCardList: CardList,
    personalDetailsList: PersonalDetailsList,
    selectedCards: string[],
    illustrations: IllustrationsType,
    companyCardIcons: CompanyCardFeedIcons,
    isClosedCards = false,
    customCardNames?: Record<string, string>,
): CardFilterItem[] {
    // Filter condition to build different cards data for closed cards and individual cards based on the isClosedCards flag, we don't want to show closed cards in the individual cards section
    const filterCondition = (card: Card) => (isClosedCards ? isCardClosed(card) : !isCardHiddenFromSearch(card) && !isCardClosed(card) && isCard(card));
    const userAssignedCards: CardFilterItem[] = Object.values(userCardList ?? {})
        .filter((card) => filterCondition(card))
        .map((card) => createCardFilterItem(card, personalDetailsList, selectedCards, illustrations, companyCardIcons, customCardNames));

    // When user is admin of a workspace he sees all the cards of workspace under cards_ Onyx key
    const allWorkspaceCards: CardFilterItem[] = Object.values(workspaceCardFeeds)
        .filter((cardFeed) => !isEmptyObject(cardFeed))
        .flatMap((cardFeed) => {
            return Object.values(cardFeed as CardList)
                .filter((card) => card && isCard(card) && !userCardList?.[card.cardID] && filterCondition(card))
                .map((card) => createCardFilterItem(card, personalDetailsList, selectedCards, illustrations, companyCardIcons, customCardNames));
        });

    return [...userAssignedCards, ...allWorkspaceCards];
}

/**
 * @param cardList - The list of cards to process. Can be undefined.
 * @returns a record where keys are domain names and values contain domain feed data.
 */
function generateDomainFeedData(cardList: CardList | undefined): Record<string, DomainFeedData> {
    return Object.values(cardList ?? {}).reduce(
        (domainFeedData, currentCard) => {
            // Cards in cardList can also be domain cards, we use them to compute domain feed
            if (!currentCard?.domainName?.match(CONST.REGEX.EXPENSIFY_POLICY_DOMAIN_NAME) && !isCardHiddenFromSearch(currentCard) && currentCard.fundID) {
                const feedCountry = getFeedCountryForDisplay(currentCard);
                const key = createCardFeedKey(currentCard.fundID, currentCard.bank, feedCountry);
                if (domainFeedData[key]) {
                    domainFeedData[key].correspondingCardIDs.push(currentCard.cardID.toString());
                } else {
                    // if the cards belongs to the same domain, every card of it should have the same fundID
                    // eslint-disable-next-line no-param-reassign
                    domainFeedData[key] = {
                        fundID: currentCard.fundID,
                        domainName: currentCard.domainName,
                        bank: currentCard?.bank,
                        correspondingCardIDs: [currentCard.cardID?.toString()],
                        ...(feedCountry ? {feedCountry} : {}),
                    };
                }
            }
            return domainFeedData;
        },
        {} as Record<string, DomainFeedData>,
    );
}

function getDomainFeedData(workspaceCardFeeds: Record<string, WorkspaceCardsList | undefined> | undefined) {
    const flattenedWorkspaceCardFeeds = Object.values(workspaceCardFeeds ?? {}).reduce<CardList>((result, domainCards) => {
        Object.assign(result, domainCards);
        return result;
    }, {});
    return generateDomainFeedData(flattenedWorkspaceCardFeeds);
}

function getWorkspaceCardFeedData(
    cardFeed: WorkspaceCardsList | undefined,
    policies: OnyxCollection<Policy>,
    repeatingBanks: string[],
    translate: LocaleContextProps['translate'],
): CardFeedData | undefined {
    const cardFeedArray = Object.values(cardFeed ?? {});
    const representativeCard = cardFeedArray.find((cardFeedItem) => isCard(cardFeedItem));
    if (!representativeCard || !cardFeedArray.some((cardFeedItem) => isCard(cardFeedItem) && !isCardHiddenFromSearch(cardFeedItem))) {
        return;
    }
    const {domainName, bank, cardName} = representativeCard;
    const isBankRepeating = repeatingBanks.includes(bank);
    const policyID = domainName.match(CONST.REGEX.EXPENSIFY_POLICY_DOMAIN_NAME)?.[1] ?? '';
    const correspondingPolicy = policies?.[`${ONYXKEYS.COLLECTION.POLICY}${policyID?.toUpperCase()}`];
    const cardFeedLabel = isBankRepeating ? correspondingPolicy?.name : undefined;
    const isPlaid = !!getPlaidInstitutionId(bank);
    const companyCardBank = isPlaid && cardName ? cardName : getBankName(bank);

    const feedCountry = getFeedCountryForDisplay(representativeCard);
    const cardFeedBankName = getCardFeedBankDisplayName(bank, feedCountry, companyCardBank, translate);
    const fullCardName =
        cardFeedBankName === CONST.COMPANY_CARDS.CARD_TYPE.CSV
            ? translate('search.filters.card.cardFeedNameCSV', {cardFeedLabel})
            : translate('search.filters.card.cardFeedName', {cardFeedBankName, cardFeedLabel});

    return {
        cardName: fullCardName,
        bank,
        label: cardFeedLabel,
        type: 'workspace',
        ...(feedCountry ? {feedCountry} : {}),
    };
}

function getDomainCardFeedData(domainFeed: DomainFeedData, policies: OnyxCollection<Policy>, repeatingBanks: string[], translate: LocaleContextProps['translate']): CardFeedData {
    const {domainName, bank, feedCountry} = domainFeed;
    const isBankRepeating = repeatingBanks.includes(bank);
    const cardFeedBankName = getCardFeedBankDisplayName(bank, feedCountry, getBankName(bank), translate);
    const cardFeedLabel = isBankRepeating ? getDescriptionForPolicyDomainCard(domainName, policies) : undefined;
    const cardName =
        cardFeedBankName === CONST.COMPANY_CARDS.CARD_TYPE.CSV
            ? translate('search.filters.card.cardFeedNameCSV', {cardFeedLabel})
            : translate('search.filters.card.cardFeedName', {cardFeedBankName, cardFeedLabel});
    return {
        cardName,
        bank,
        label: cardFeedLabel,
        type: 'domain',
        ...(feedCountry ? {feedCountry} : {}),
    };
}

function filterOutDomainCards(workspaceCardFeeds: Record<string, WorkspaceCardsList | undefined> | undefined) {
    const domainFeedData = getDomainFeedData(workspaceCardFeeds);
    return Object.entries(workspaceCardFeeds ?? {}).filter(([, workspaceFeed]) => {
        const firstCard = Object.values(workspaceFeed ?? {}).find(isCard);
        if (!firstCard) {
            return !isEmptyObject(workspaceFeed);
        }
        const feedCountry = getFeedCountryForDisplay(firstCard);
        const workspaceKey = createCardFeedKey(firstCard.fundID, firstCard.bank, feedCountry);
        if (workspaceKey in domainFeedData) {
            return false;
        }
        return !isEmptyObject(workspaceFeed);
    });
}

function getCardFeedsData({workspaceCardFeeds, policies, translate}: GetCardFeedData) {
    const domainFeedData = getDomainFeedData(workspaceCardFeeds);
    const repeatingBanks = getRepeatingBanks(Object.keys(workspaceCardFeeds ?? CONST.EMPTY_OBJECT), domainFeedData);
    const cardFeedData: Record<string, CardFeedData> = {};

    for (const [cardFeedKey, cardFeed] of filterOutDomainCards(workspaceCardFeeds)) {
        const workspaceData = getWorkspaceCardFeedData(cardFeed, policies, repeatingBanks, translate);
        if (workspaceData) {
            cardFeedData[cardFeedKey] = workspaceData;
        }
    }

    for (const domainFeed of Object.values(domainFeedData)) {
        const cardFeedKey = createCardFeedKey(`cards_${domainFeed.fundID}`, domainFeed.bank, domainFeed.feedCountry);
        cardFeedData[cardFeedKey] = getDomainCardFeedData(domainFeed, policies, repeatingBanks, translate);
    }

    return cardFeedData;
}

function getCardFeedNamesWithType(params: GetCardFeedData) {
    const cardFeedData = getCardFeedsData(params);
    return Object.keys(cardFeedData).reduce<CardFeedNamesWithType>((cardFeedNamesWithType, cardFeedKey) => {
        /* eslint-disable-next-line no-param-reassign */
        cardFeedNamesWithType[cardFeedKey] = {
            name: cardFeedData[cardFeedKey].cardName,
            type: cardFeedData[cardFeedKey].type,
        };
        return cardFeedNamesWithType;
    }, {});
}

function createCardFeedKey(fundID: string | undefined, bank: string, feedCountry: string | undefined) {
    if (!fundID) {
        return bank;
    }
    if (feedCountry) {
        return `${fundID}_${bank}_${feedCountry}`;
    }
    return `${fundID}_${bank}`;
}

function createCardFeedItem({
    cardName,
    bank,
    keyForList,
    cardFeedKey,
    correspondingCardIDs,
    selectedCards,
    illustrations,
    companyCardIcons,
}: {
    cardName: string;
    bank: CardFeedWithNumber;
    keyForList: string;
    cardFeedKey: string;
    correspondingCardIDs: string[];
    selectedCards: string[];
    illustrations: IllustrationsType;
    companyCardIcons: CompanyCardFeedIcons;
}): CardFilterItem {
    const isSelected = correspondingCardIDs.every((card) => selectedCards.includes(card));
    const plaidUrl = getPlaidInstitutionIconUrl(bank);

    const icon = getCardFeedIcon(bank, illustrations, companyCardIcons);
    return {
        text: cardName,
        keyForList,
        isSelected,
        shouldShowOwnersAvatar: false,
        bankIcon: {
            icon,
        },
        plaidUrl,
        cardFeedKey,
        isCardFeed: true,
        correspondingCards: correspondingCardIDs,
    };
}

function buildCardFeedsData(
    workspaceCardFeeds: Record<string, WorkspaceCardsList | undefined>,
    domainFeedsData: Record<string, DomainFeedData>,
    policies: OnyxCollection<Policy>,
    selectedCards: string[],
    translate: LocaleContextProps['translate'],
    illustrations: IllustrationsType,
    companyCardIcons: CompanyCardFeedIcons,
): CardFilterItem[] {
    const feeds: CardFilterItem[] = [];
    const repeatingBanks = getRepeatingBanks(Object.keys(workspaceCardFeeds), domainFeedsData);

    for (const domainFeed of Object.values(domainFeedsData)) {
        const {domainName, bank, correspondingCardIDs, feedCountry} = domainFeed;

        const cardFeedKey = createCardFeedKey(domainFeed.fundID, bank, feedCountry);
        const {cardName} = getDomainCardFeedData(domainFeed, policies, repeatingBanks, translate);

        feeds.push(
            createCardFeedItem({
                cardName,
                bank,
                correspondingCardIDs,
                keyForList: feedCountry ? `${domainName}-${bank}-${feedCountry}` : `${domainName}-${bank}`,
                cardFeedKey,
                selectedCards,
                illustrations,
                companyCardIcons,
            }),
        );
    }

    for (const [workspaceFeedKey, workspaceFeed] of filterOutDomainCards(workspaceCardFeeds)) {
        const correspondingCardIDs = Object.entries(workspaceFeed ?? {})
            .filter(([cardKey, card]) => cardKey !== 'cardList' && isCard(card) && !isCardHiddenFromSearch(card))
            .map(([cardKey]) => cardKey);

        const cardFeedData = getWorkspaceCardFeedData(workspaceFeed, policies, repeatingBanks, translate);
        if (!cardFeedData) {
            continue;
        }
        const {cardName, bank} = cardFeedData;
        const cardFeedKey = getCardFeedKey(workspaceCardFeeds, workspaceFeedKey);

        feeds.push(
            createCardFeedItem({
                cardName,
                bank,
                correspondingCardIDs,
                cardFeedKey: cardFeedKey ?? '',
                keyForList: workspaceFeedKey,
                selectedCards,
                illustrations,
                companyCardIcons,
            }),
        );
    }

    return feeds;
}

function getSelectedCardsFromFeeds(cards: CardList | undefined, workspaceCardFeeds?: Record<string, WorkspaceCardsList | undefined>, selectedFeeds?: string[]): string[] {
    const domainFeedsData = generateDomainFeedData(cards);
    const domainFeedCards = Object.fromEntries(
        Object.values(domainFeedsData).map((domainFeedData) => [
            createCardFeedKey(domainFeedData.fundID, domainFeedData.bank, domainFeedData.feedCountry),
            domainFeedData.correspondingCardIDs,
        ]),
    );

    if (!workspaceCardFeeds || !selectedFeeds) {
        return [];
    }

    const selectedCards = selectedFeeds.flatMap((cardFeedKey) => {
        const workspaceCardFeed = workspaceCardFeeds[getWorkspaceCardFeedKey(cardFeedKey)];
        if (!workspaceCardFeed) {
            if (!cards || !domainFeedCards[cardFeedKey] || Object.keys(domainFeedCards).length === 0) {
                return [];
            }

            return domainFeedCards[cardFeedKey].filter((cardNumber) => cards[cardNumber].state !== CONST.EXPENSIFY_CARD.STATE.STATE_NOT_ISSUED);
        }

        return Object.keys(workspaceCardFeed).filter((cardNumber) => workspaceCardFeed[cardNumber].state !== CONST.EXPENSIFY_CARD.STATE.STATE_NOT_ISSUED);
    });

    return [...new Set(selectedCards)];
}

/**
 * Returns the wire-level country segment used in the Search feed filter token for a card. We only
 * care about Travel Invoicing feed country segment since it has its own
 * Onyx key and its own search feed. Every other bank and every other Expensify Card program
 * (US/GB/CURRENT) shares the 2-segment token, so we return an empty string and the token and the
 * Onyx key always line up.
 */
function getFeedCountryForDisplay(card: Card): string {
    if (card.bank !== CONST.EXPENSIFY_CARD.BANK) {
        return '';
    }
    return card.nameValuePairs?.feedCountry === CONST.TRAVEL.PROGRAM_TRAVEL_US ? CONST.TRAVEL.PROGRAM_TRAVEL_US : '';
}

function getCardFeedBankDisplayName(bank: string, feedCountry: string | undefined, companyCardBankName: string, translate: LocaleContextProps['translate']): string {
    if (bank !== CONST.EXPENSIFY_CARD.BANK) {
        return companyCardBankName;
    }
    if (feedCountry === CONST.TRAVEL.PROGRAM_TRAVEL_US) {
        return translate('search.filters.card.travelInvoicing');
    }
    return translate('search.filters.card.expensify');
}

function getExpensifyCardFeedsForDisplay(allCards: CardList | undefined, translate: LocaleContextProps['translate'] | undefined): CardFeedsForDisplay {
    const result = {} as CardFeedsForDisplay;

    for (const card of Object.values(allCards ?? {})) {
        if (card.bank !== CONST.EXPENSIFY_CARD.BANK || !card.fundID) {
            continue;
        }

        const feedCountry = getFeedCountryForDisplay(card);
        const id = feedCountry ? `${card.fundID}_${CONST.EXPENSIFY_CARD.BANK}_${feedCountry}` : `${card.fundID}_${CONST.EXPENSIFY_CARD.BANK}`;

        if (result[id]) {
            continue;
        }

        // Travel Invoicing lives on its own feed but shares the `Expensify Card` bank. Use the
        // translated label so the Feed dropdown shows "Travel Invoicing" for travel cards and
        // "Expensify Card" for everything else.
        const name = translate && feedCountry === CONST.TRAVEL.PROGRAM_TRAVEL_US ? translate('search.filters.card.travelInvoicing') : CONST.EXPENSIFY_CARD.BANK;

        result[id] = {
            id,
            feed: CONST.EXPENSIFY_CARD.BANK,
            fundID: card.fundID,
            name,
            ...(feedCountry ? {country: feedCountry} : {}),
        };
    }

    return result;
}

/**
 * Given a collection of card feeds, return formatted card feeds.
 *
 * The `allCards` parameter is only used to determine if we should add the "Expensify Card" feeds.
 */
function getCardFeedsForDisplay(
    allCardFeeds: OnyxCollection<CardFeeds>,
    allCards: CardList | undefined,
    translate: LocalizedTranslate,
    feedKeysWithCards?: FeedKeysWithAssignedCards,
): CardFeedsForDisplay {
    const cardFeedsForDisplay = {} as CardFeedsForDisplay;

    for (const [domainKey, cardFeeds] of Object.entries(allCardFeeds ?? {})) {
        // sharedNVP_private_domain_member_123456 -> 123456
        const fundID = domainKey.split('_').at(-1);
        if (!fundID) {
            continue;
        }

        for (const key of Object.keys(getOriginalCompanyFeeds(cardFeeds, feedKeysWithCards, Number(fundID)))) {
            const feed = key as CardFeedWithNumber;
            const id = `${fundID}_${feed}`;

            if (cardFeedsForDisplay[id]) {
                continue;
            }

            cardFeedsForDisplay[id] = {
                id,
                feed,
                fundID,
                name: getCustomOrFormattedFeedName(translate, feed, cardFeeds?.settings?.companyCardNicknames?.[feed], false) ?? feed,
            };
        }
    }

    Object.assign(cardFeedsForDisplay, getExpensifyCardFeedsForDisplay(allCards, translate));

    return cardFeedsForDisplay;
}

/**
 * Given a collection of card feeds, return formatted card feeds grouped per policy.
 *
 * Each feed is assigned to one or more policies using a three-tier fallback:
 *  1. **linkedPolicyIDs** – if the feed has explicit linked policies, it is indexed under each of them.
 *  2. **preferredPolicy** – if there are no linked policies but a preferred policy exists, use that.
 *  3. **policyAccountID match** – if neither is set (orphan feed), fall back to any policy whose
 *     policyAccountID matches the feed's fundID so the feed still surfaces under the correct workspace.
 *     If no policy matches, the feed is stored under an empty-string key to avoid being silently lost.
 *
 * Note: "Expensify Card" feeds are not included.
 */
function getCardFeedsForDisplayPerPolicy(
    allCardFeeds: OnyxCollection<CardFeeds>,
    translate: LocalizedTranslate,
    feedKeysWithCards: FeedKeysWithAssignedCards | undefined,
    policies: OnyxCollection<Policy>,
): Record<string, CardFeedForDisplay[]> {
    const cardFeedsForDisplayPerPolicy = {} as Record<string, CardFeedForDisplay[]>;

    for (const [domainKey, cardFeeds] of Object.entries(allCardFeeds ?? {})) {
        // sharedNVP_private_domain_member_123456 -> 123456
        const fundID = domainKey.split('_').at(-1);
        if (!fundID) {
            continue;
        }

        for (const [key, feedData] of Object.entries(getOriginalCompanyFeeds(cardFeeds, feedKeysWithCards, Number(fundID)))) {
            const preferredPolicy = feedData && 'preferredPolicy' in feedData ? (feedData.preferredPolicy ?? '') : '';
            const country = feedData && 'country' in feedData ? (feedData.country ?? '') : '';
            const linkedPolicyIDs = feedData && 'linkedPolicyIDs' in feedData ? feedData.linkedPolicyIDs : undefined;
            const feed = key as CardFeedWithNumber;
            const id = `${fundID}_${feed}`;
            const feedEntry: CardFeedForDisplay = {
                id,
                feed,
                country,
                fundID,
                linkedPolicyIDs,
                name: getCustomOrFormattedFeedName(translate, feed, cardFeeds?.settings?.companyCardNicknames?.[feed], false) ?? feed,
            };

            const validLinkedPolicyIDs = linkedPolicyIDs?.filter(Boolean);
            if (validLinkedPolicyIDs?.length) {
                // Index the feed under each linked policy so it appears for all of them
                for (const linkedPolicyID of validLinkedPolicyIDs) {
                    (cardFeedsForDisplayPerPolicy[linkedPolicyID] ||= []).push(feedEntry);
                }
            } else if (preferredPolicy) {
                (cardFeedsForDisplayPerPolicy[preferredPolicy] ||= []).push(feedEntry);
            } else {
                // Orphan feed: no linkedPolicyIDs and no preferredPolicy.
                // Find policies whose policyAccountID matches the fundID so the feed
                // still appears under the correct workspace.
                const numericFundID = Number(fundID);
                const matchingPolicies = Object.values(policies ?? {}).filter((policy) => policy?.policyAccountID === numericFundID);
                if (matchingPolicies.length) {
                    for (const policy of matchingPolicies) {
                        if (policy?.id) {
                            (cardFeedsForDisplayPerPolicy[policy.id] ||= []).push(feedEntry);
                        }
                    }
                } else {
                    // Still store under empty key so the feed is not silently lost
                    (cardFeedsForDisplayPerPolicy[''] ||= []).push(feedEntry);
                }
            }
        }
    }

    return cardFeedsForDisplayPerPolicy;
}

/**
 * Narrows a raw company-feed object key (widened to `string` by `Object.entries`) to `CardFeedWithNumber`.
 * This is not a full type guard that validates the key against the union — it only asserts that a non-empty
 * key belongs to `CardFeedWithNumber` (the map is keyed by that union at runtime), and rejects empty keys.
 * Used to avoid an unsafe `as` assertion when iterating the feed map.
 */
function isCardFeedWithNumber(feedKey: string): feedKey is CardFeedWithNumber {
    return !!feedKey;
}

/**
 * Returns the company card feeds that should be visible to the current user in the feed selector,
 * enumerated exactly once per feed (keyed by `${fundID}_${feed}`).
 *
 * A feed is gathered from one of two sources:
 *  1. A domain the user is an admin of (the domain's account ID matches the feed's fundID).
 *  2. A policy the user is an admin of whose `policyAccountID` matches the feed's fundID.
 *
 * Whether a feed shows as an available feed or under "From other workspaces" is decided by the
 * caller using `linkedPolicyIDs` (active policy in `linkedPolicyIDs` → available, otherwise other).
 * There is intentionally no decision based on `preferredPolicy`.
 *
 * Note: "Expensify Card" feeds are not included (handled by the Expensify card selector).
 */
function getVisibleCompanyCardFeedsForSelector(
    allCardFeeds: OnyxCollection<CardFeeds>,
    translate: LocalizedTranslate,
    feedKeysWithCards: FeedKeysWithAssignedCards | undefined,
    policies: OnyxCollection<Policy>,
    domains: OnyxCollection<Domain>,
    currentUserAccountID: number,
): CardFeedForDisplay[] {
    const visibleFeeds: CardFeedForDisplay[] = [];
    const seenFeedIDs = new Set<string>();

    // Precompute the fundIDs (policyAccountIDs) backed by non-deleted policies the user can administer.
    // This avoids re-scanning every policy for each domain entry (was O(domains × policies)).
    const adminPolicyFundIDs = new Set<number>();
    for (const policy of Object.values(policies ?? {})) {
        if (policy?.policyAccountID === undefined || !isPolicyAdmin(policy) || policy.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE) {
            continue;
        }
        adminPolicyFundIDs.add(policy.policyAccountID);
    }

    for (const [domainKey, cardFeeds] of Object.entries(allCardFeeds ?? {})) {
        // sharedNVP_private_domain_member_123456 -> 123456
        const fundID = domainKey.split('_').at(-1);
        if (!fundID) {
            continue;
        }
        const numericFundID = Number(fundID);

        // Visibility: the user must be an admin of the feed's domain or of a policy backed by this fund.
        const domain = getDomainByFundID(domains, numericFundID);
        const isDomainAdmin = isAdminSelector(currentUserAccountID)(domain);
        const isWorkspaceAdmin = adminPolicyFundIDs.has(numericFundID);
        if (!isDomainAdmin && !isWorkspaceAdmin) {
            continue;
        }

        for (const [key, feedData] of Object.entries(getOriginalCompanyFeeds(cardFeeds, feedKeysWithCards, numericFundID))) {
            // `getOriginalCompanyFeeds` is keyed by `CardFeedWithNumber`, but `Object.entries` widens the key to
            // `string`. Narrow it back with a type guard instead of an unsafe `as` assertion.
            if (!isCardFeedWithNumber(key)) {
                continue;
            }
            const country = feedData && 'country' in feedData ? (feedData.country ?? '') : '';
            const linkedPolicyIDs = feedData && 'linkedPolicyIDs' in feedData ? feedData.linkedPolicyIDs : undefined;
            const feed = key;
            const id = `${fundID}_${feed}`;
            if (seenFeedIDs.has(id)) {
                continue;
            }
            seenFeedIDs.add(id);
            visibleFeeds.push({
                id,
                feed,
                country,
                fundID,
                linkedPolicyIDs,
                name: getCustomOrFormattedFeedName(translate, feed, cardFeeds?.settings?.companyCardNicknames?.[feed], false) ?? feed,
            });
        }
    }

    return visibleFeeds;
}

/**
 * Finds a feed by id in the card feeds grouped by policy.
 *
 * @param feedId - The feed id (e.g. `${fundID}_${feed}`) to look up
 * @param cardFeedsByPolicy - Card feeds per policy from getCardFeedsForDisplayPerPolicy
 * @returns The matching CardFeedForDisplay or undefined
 */
function getFeedInfo(feedId: string, cardFeedsByPolicy?: Record<string, CardFeedForDisplay[]>): CardFeedForDisplay | undefined {
    if (!feedId || !cardFeedsByPolicy) {
        return undefined;
    }
    for (const cardFeeds of Object.values(cardFeedsByPolicy)) {
        const found = cardFeeds.find((item) => item.id === feedId);
        if (found) {
            return found;
        }
    }
    return undefined;
}

function getCardFeedStatus(feed: CardFeeds | undefined): CardFeedsStatus {
    return {
        errors: feed?.errors,
        isLoading: feed?.isLoading,
        hasOnceLoaded: feed?.hasOnceLoaded,
    };
}

function getWorkspaceCardFeedsStatus(allFeeds: OnyxCollection<CardFeeds> | undefined): CardFeedsStatusByDomainID {
    return Object.entries(allFeeds ?? {}).reduce<CardFeedsStatusByDomainID>((acc, [onyxKey, feeds]) => {
        const domainID = Number(onyxKey.split('_').at(-1));
        acc[domainID] = getCardFeedStatus(feeds);
        return acc;
    }, {} as CardFeedsStatusByDomainID);
}

function getCombinedCardFeedsFromAllFeeds(
    allFeeds: OnyxCollection<CardFeeds> | undefined,
    includeFeedPredicate?: (feed: CombinedCardFeed) => boolean,
    feedKeysWithCards?: FeedKeysWithAssignedCards,
): CombinedCardFeeds {
    return Object.entries(allFeeds ?? {}).reduce<CombinedCardFeeds>((acc, [onyxKey, feeds]) => {
        const domainID = Number(onyxKey.split('_').at(-1));

        const workspaceFeedsSettings = feeds?.settings;
        const companyCards = workspaceFeedsSettings?.companyCards;

        if (!companyCards) {
            return acc;
        }

        for (const feedName of Object.keys(companyCards) as CardFeedWithNumber[]) {
            const feedSettings = companyCards?.[feedName];
            const oAuthAccountDetails = workspaceFeedsSettings?.oAuthAccountDetails?.[feedName];
            const customFeedName = workspaceFeedsSettings?.companyCardNicknames?.[feedName];
            const status = workspaceFeedsSettings?.cardFeedsStatus?.[feedName];

            if (!domainID) {
                continue;
            }

            // When we have card data, filter out stale feeds:
            // - Direct feeds without oAuthAccountDetails AND no assigned cards
            // - "Gray zone" feeds (not commercial, not direct, not CSV upload) without assigned cards
            // CSV upload feeds are always shown when they exist in settings, since their
            // unassigned cards are loaded on-demand when the feed is selected.
            if (feedKeysWithCards) {
                if (isDirectFeed(feedName) && !oAuthAccountDetails && !feedHasCards(feedName, domainID, feedKeysWithCards)) {
                    continue;
                }
                if (!isCustomFeed(feedName) && !isDirectFeed(feedName) && !isCSVUploadFeed(feedName) && !feedHasCards(feedName, domainID, feedKeysWithCards)) {
                    continue;
                }
            }

            const combinedCardFeed: CombinedCardFeed = {
                ...feedSettings,
                ...oAuthAccountDetails,
                customFeedName: customFeedName ?? feedSettings?.uploadLayoutSettings?.layoutName,
                domainID,
                feed: feedName,
                status,
            };

            if (includeFeedPredicate && !includeFeedPredicate(combinedCardFeed)) {
                continue;
            }

            const combinedFeedKey = getCardFeedWithDomainID(feedName, domainID);

            acc[combinedFeedKey] = combinedCardFeed;
        }

        return acc;
    }, {});
}

export type {CardFilterItem, CardFeedForDisplay};
export type {DomainFeedData};
export {
    buildCardsData,
    getCardFeedNamesWithType,
    buildCardFeedsData,
    getSelectedCardsFromFeeds,
    getFeedInfo,
    getLinkedPolicyName,
    getCardFeedsForDisplay,
    getExpensifyCardFeedsForDisplay,
    getCardFeedsForDisplayPerPolicy,
    getVisibleCompanyCardFeedsForSelector,
    getCombinedCardFeedsFromAllFeeds,
    getWorkspaceCardFeedsStatus,
};
