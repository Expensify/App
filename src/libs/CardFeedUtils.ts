import type {OnyxCollection} from 'react-native-onyx';
import type {LocaleContextProps} from '@components/LocaleContextProvider';
import type {AdditionalCardProps} from '@components/SelectionListWithSections/Search/CardListItem';
import type IllustrationsType from '@styles/theme/illustrations/types';
import CONST from '@src/CONST';
import type {CombinedCardFeeds} from '@src/hooks/useCardFeeds';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Card, CardFeeds, CardList, PersonalDetailsList, WorkspaceCardsList} from '@src/types/onyx';
import type {CardFeedWithNumber, CombinedCardFeed, CompanyCardFeedWithNumber} from '@src/types/onyx/CardFeeds';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import {
    getBankName,
    getCardFeedIcon,
    getCompanyCardFeedWithDomainID,
    getCustomOrFormattedFeedName,
    getOriginalCompanyFeeds,
    getPlaidInstitutionIconUrl,
    getPlaidInstitutionId,
    isCard,
    isCardClosed,
    isCardHiddenFromSearch,
} from './CardUtils';
import type {CompanyCardFeedIcons} from './CardUtils';
// eslint-disable-next-line @typescript-eslint/no-deprecated
import {translateLocal} from './Localize';
import {getDescriptionForPolicyDomainCard, getPolicy} from './PolicyUtils';
import type {OptionData} from './ReportUtils';

type CardFilterItem = Partial<OptionData> & AdditionalCardProps & {isCardFeed?: boolean; correspondingCards?: string[]; cardFeedKey: string; plaidUrl?: string};
type DomainFeedData = {bank: CardFeedWithNumber; domainName: string; correspondingCardIDs: string[]; fundID?: string};
type ItemsGroupedBySelection = {selected: CardFilterItem[]; unselected: CardFilterItem[]};
type CardFeedNamesWithType = Record<string, {name: string; type: 'domain' | 'workspace'}>;
type CardFeedData = {cardName: string; bank: CardFeedWithNumber; label?: string; type: 'domain' | 'workspace'};
type GetCardFeedData = {
    workspaceCardFeeds: Record<string, WorkspaceCardsList | undefined> | undefined;
    translate: LocaleContextProps['translate'];
};
type CardFeedForDisplay = {
    id: string;
    feed: CardFeedWithNumber;
    fundID: string;
    name: string;
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
    const {fundID, bank} = representativeCard;
    return createCardFeedKey(fundID, bank);
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

function createCardFilterItem(
    card: Card,
    personalDetailsList: PersonalDetailsList,
    selectedCards: string[],
    illustrations: IllustrationsType,
    companyCardIcons: CompanyCardFeedIcons,
): CardFilterItem {
    const personalDetails = personalDetailsList[card?.accountID ?? CONST.DEFAULT_NUMBER_ID];
    const isSelected = selectedCards.includes(card.cardID.toString());
    const icon = getCardFeedIcon(card?.bank, illustrations, companyCardIcons);
    const cardName = card?.nameValuePairs?.cardTitle;
    const text = personalDetails?.displayName ?? cardName;
    const plaidUrl = getPlaidInstitutionIconUrl(card?.bank);

    return {
        lastFourPAN: card.lastFourPAN,
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
): ItemsGroupedBySelection {
    // Filter condition to build different cards data for closed cards and individual cards based on the isClosedCards flag, we don't want to show closed cards in the individual cards section
    const filterCondition = (card: Card) => (isClosedCards ? isCardClosed(card) : !isCardHiddenFromSearch(card) && !isCardClosed(card) && isCard(card));
    const userAssignedCards: CardFilterItem[] = Object.values(userCardList ?? {})
        .filter((card) => filterCondition(card))
        .map((card) => createCardFilterItem(card, personalDetailsList, selectedCards, illustrations, companyCardIcons));

    // When user is admin of a workspace he sees all the cards of workspace under cards_ Onyx key
    const allWorkspaceCards: CardFilterItem[] = Object.values(workspaceCardFeeds)
        .filter((cardFeed) => !isEmptyObject(cardFeed))
        .flatMap((cardFeed) => {
            return Object.values(cardFeed as CardList)
                .filter((card) => card && isCard(card) && !userCardList?.[card.cardID] && filterCondition(card))
                .map((card) => createCardFilterItem(card, personalDetailsList, selectedCards, illustrations, companyCardIcons));
        });

    const allCardItems = [...userAssignedCards, ...allWorkspaceCards];
    const selectedCardItems: CardFilterItem[] = [];
    const unselectedCardItems: CardFilterItem[] = [];
    for (const card of allCardItems) {
        if (card.isSelected) {
            selectedCardItems.push(card);
        } else {
            unselectedCardItems.push(card);
        }
    }
    return {selected: selectedCardItems, unselected: unselectedCardItems};
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
                if (domainFeedData[`${currentCard.fundID}_${currentCard.bank}`]) {
                    domainFeedData[`${currentCard.fundID}_${currentCard.bank}`].correspondingCardIDs.push(currentCard.cardID.toString());
                } else {
                    // if the cards belongs to the same domain, every card of it should have the same fundID
                    // eslint-disable-next-line no-param-reassign
                    domainFeedData[`${currentCard.fundID}_${currentCard.bank}`] = {
                        fundID: currentCard.fundID,
                        domainName: currentCard.domainName,
                        bank: currentCard?.bank,
                        correspondingCardIDs: [currentCard.cardID?.toString()],
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

function getWorkspaceCardFeedData(cardFeed: WorkspaceCardsList | undefined, repeatingBanks: string[], translate: LocaleContextProps['translate']): CardFeedData | undefined {
    const cardFeedArray = Object.values(cardFeed ?? {});
    const representativeCard = cardFeedArray.find((cardFeedItem) => isCard(cardFeedItem));
    if (!representativeCard || !cardFeedArray.some((cardFeedItem) => isCard(cardFeedItem) && !isCardHiddenFromSearch(cardFeedItem))) {
        return;
    }
    const {domainName, bank, cardName} = representativeCard;
    const isBankRepeating = repeatingBanks.includes(bank);
    const policyID = domainName.match(CONST.REGEX.EXPENSIFY_POLICY_DOMAIN_NAME)?.[1] ?? '';
    // This will be fixed as part of https://github.com/Expensify/Expensify/issues/507850
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    const correspondingPolicy = getPolicy(policyID?.toUpperCase());
    const cardFeedLabel = isBankRepeating ? correspondingPolicy?.name : undefined;
    const isPlaid = !!getPlaidInstitutionId(bank);
    const companyCardBank = isPlaid && cardName ? cardName : getBankName(bank);

    const cardFeedBankName = bank === CONST.EXPENSIFY_CARD.BANK ? translate('search.filters.card.expensify') : companyCardBank;
    const fullCardName =
        cardFeedBankName === CONST.COMPANY_CARDS.CARD_TYPE.CSV
            ? translate('search.filters.card.cardFeedNameCSV', {cardFeedLabel})
            : translate('search.filters.card.cardFeedName', {cardFeedBankName, cardFeedLabel});

    return {
        cardName: fullCardName,
        bank,
        label: cardFeedLabel,
        type: 'workspace',
    };
}

function getDomainCardFeedData(domainFeed: DomainFeedData, repeatingBanks: string[], translate: LocaleContextProps['translate']): CardFeedData {
    const {domainName, bank} = domainFeed;
    const isBankRepeating = repeatingBanks.includes(bank);
    const cardFeedBankName = bank === CONST.EXPENSIFY_CARD.BANK ? translate('search.filters.card.expensify') : getBankName(bank);
    const cardFeedLabel = isBankRepeating ? getDescriptionForPolicyDomainCard(domainName) : undefined;
    const cardName =
        cardFeedBankName === CONST.COMPANY_CARDS.CARD_TYPE.CSV
            ? translate('search.filters.card.cardFeedNameCSV', {cardFeedLabel})
            : translate('search.filters.card.cardFeedName', {cardFeedBankName, cardFeedLabel});
    return {
        cardName,
        bank,
        label: cardFeedLabel,
        type: 'domain',
    };
}

function filterOutDomainCards(workspaceCardFeeds: Record<string, WorkspaceCardsList | undefined> | undefined) {
    const domainFeedData = getDomainFeedData(workspaceCardFeeds);
    return Object.entries(workspaceCardFeeds ?? {}).filter(([, workspaceFeed]) => {
        const domainFeed = Object.values(workspaceFeed ?? {}).at(0) ?? {};
        if (`${domainFeed.fundID}_${domainFeed.bank}` in domainFeedData) {
            return false;
        }
        return !isEmptyObject(workspaceFeed);
    });
}

function getCardFeedsData({workspaceCardFeeds, translate}: GetCardFeedData) {
    const domainFeedData = getDomainFeedData(workspaceCardFeeds);
    const repeatingBanks = getRepeatingBanks(Object.keys(workspaceCardFeeds ?? CONST.EMPTY_OBJECT), domainFeedData);
    const cardFeedData: Record<string, CardFeedData> = {};

    for (const [cardFeedKey, cardFeed] of filterOutDomainCards(workspaceCardFeeds)) {
        const workspaceData = getWorkspaceCardFeedData(cardFeed, repeatingBanks, translate);
        if (workspaceData) {
            cardFeedData[cardFeedKey] = workspaceData;
        }
    }

    for (const domainFeed of Object.values(domainFeedData)) {
        const cardFeedKey = createCardFeedKey(`cards_${domainFeed.fundID}`, domainFeed.bank);
        cardFeedData[cardFeedKey] = getDomainCardFeedData(domainFeed, repeatingBanks, translate);
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

function createCardFeedKey(fundID: string | undefined, bank: string) {
    if (!fundID) {
        return bank;
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
    selectedCards: string[],
    translate: LocaleContextProps['translate'],
    illustrations: IllustrationsType,
    companyCardIcons: CompanyCardFeedIcons,
): ItemsGroupedBySelection {
    const selectedFeeds: CardFilterItem[] = [];
    const unselectedFeeds: CardFilterItem[] = [];
    const repeatingBanks = getRepeatingBanks(Object.keys(workspaceCardFeeds), domainFeedsData);

    for (const domainFeed of Object.values(domainFeedsData)) {
        const {domainName, bank, correspondingCardIDs} = domainFeed;

        const cardFeedKey = createCardFeedKey(domainFeed.fundID, bank);
        const {cardName} = getDomainCardFeedData(domainFeed, repeatingBanks, translate);

        const feedItem = createCardFeedItem({
            cardName,
            bank,
            correspondingCardIDs,
            keyForList: `${domainName}-${bank}`,
            cardFeedKey,
            selectedCards,
            illustrations,
            companyCardIcons,
        });
        if (feedItem.isSelected) {
            selectedFeeds.push(feedItem);
        } else {
            unselectedFeeds.push(feedItem);
        }
    }

    for (const [workspaceFeedKey, workspaceFeed] of filterOutDomainCards(workspaceCardFeeds)) {
        const correspondingCardIDs = Object.entries(workspaceFeed ?? {})
            .filter(([cardKey, card]) => cardKey !== 'cardList' && isCard(card) && !isCardHiddenFromSearch(card))
            .map(([cardKey]) => cardKey);

        const cardFeedData = getWorkspaceCardFeedData(workspaceFeed, repeatingBanks, translate);
        if (!cardFeedData) {
            continue;
        }
        const {cardName, bank} = cardFeedData;
        const cardFeedKey = getCardFeedKey(workspaceCardFeeds, workspaceFeedKey);

        const feedItem = createCardFeedItem({
            cardName,
            bank,
            correspondingCardIDs,
            cardFeedKey: cardFeedKey ?? '',
            keyForList: workspaceFeedKey,
            selectedCards,
            illustrations,
            companyCardIcons,
        });
        if (feedItem.isSelected) {
            selectedFeeds.push(feedItem);
        } else {
            unselectedFeeds.push(feedItem);
        }
    }

    return {selected: selectedFeeds, unselected: unselectedFeeds};
}

function getSelectedCardsFromFeeds(cards: CardList | undefined, workspaceCardFeeds?: Record<string, WorkspaceCardsList | undefined>, selectedFeeds?: string[]): string[] {
    const domainFeedsData = generateDomainFeedData(cards);
    const domainFeedCards = Object.fromEntries(
        Object.values(domainFeedsData).map((domainFeedData) => [createCardFeedKey(domainFeedData.fundID, domainFeedData.bank), domainFeedData.correspondingCardIDs]),
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

const generateSelectedCards = (
    cardList: CardList | undefined,
    workspaceCardFeeds: Record<string, WorkspaceCardsList | undefined> | undefined,
    feeds: string[] | undefined,
    cards: string[] | undefined,
) => {
    const selectedCards = getSelectedCardsFromFeeds(cardList, workspaceCardFeeds, feeds);
    return [...new Set([...selectedCards, ...(cards ?? [])])];
};

/**
 * Given a collection of card feeds, return formatted card feeds.
 *
 * The `allCards` parameter is only used to determine if we should add the "Expensify Card" feeds.
 */
function getCardFeedsForDisplay(allCardFeeds: OnyxCollection<CardFeeds>, allCards: CardList): CardFeedsForDisplay {
    const cardFeedsForDisplay = {} as CardFeedsForDisplay;

    for (const [domainKey, cardFeeds] of Object.entries(allCardFeeds ?? {})) {
        // sharedNVP_private_domain_member_123456 -> 123456
        const fundID = domainKey.split('_').at(-1);
        if (!fundID) {
            continue;
        }

        for (const key of Object.keys(getOriginalCompanyFeeds(cardFeeds))) {
            const feed = key as CompanyCardFeedWithNumber;
            const id = `${fundID}_${feed}`;

            if (cardFeedsForDisplay[id]) {
                continue;
            }

            cardFeedsForDisplay[id] = {
                id,
                feed,
                fundID,
                // eslint-disable-next-line @typescript-eslint/no-deprecated
                name: getCustomOrFormattedFeedName(translateLocal, feed, cardFeeds?.settings?.companyCardNicknames?.[feed], false) ?? feed,
            };
        }
    }

    for (const card of Object.values(allCards)) {
        if (card.bank !== CONST.EXPENSIFY_CARD.BANK || !card.fundID) {
            continue;
        }

        const id = `${card.fundID}_${CONST.EXPENSIFY_CARD.BANK}`;

        if (cardFeedsForDisplay[id]) {
            continue;
        }

        cardFeedsForDisplay[id] = {
            id,
            feed: CONST.EXPENSIFY_CARD.BANK,
            fundID: card.fundID,
            name: CONST.EXPENSIFY_CARD.BANK,
        };
    }

    return cardFeedsForDisplay;
}

/**
 * Given a collection of card feeds, return formatted card feeds grouped per policy.
 *
 * Note: "Expensify Card" feeds are not included.
 */
function getCardFeedsForDisplayPerPolicy(allCardFeeds: OnyxCollection<CardFeeds>): Record<string, CardFeedForDisplay[]> {
    const cardFeedsForDisplayPerPolicy = {} as Record<string, CardFeedForDisplay[]>;

    for (const [domainKey, cardFeeds] of Object.entries(allCardFeeds ?? {})) {
        // sharedNVP_private_domain_member_123456 -> 123456
        const fundID = domainKey.split('_').at(-1);
        if (!fundID) {
            continue;
        }

        for (const [key, feedData] of Object.entries(getOriginalCompanyFeeds(cardFeeds))) {
            const preferredPolicy = feedData && 'preferredPolicy' in feedData ? (feedData.preferredPolicy ?? '') : '';
            const feed = key as CompanyCardFeedWithNumber;
            const id = `${fundID}_${feed}`;

            (cardFeedsForDisplayPerPolicy[preferredPolicy] ||= []).push({
                id,
                feed,
                fundID,
                // eslint-disable-next-line @typescript-eslint/no-deprecated
                name: getCustomOrFormattedFeedName(translateLocal, feed, cardFeeds?.settings?.companyCardNicknames?.[feed], false) ?? feed,
            });
        }
    }

    return cardFeedsForDisplayPerPolicy;
}

function getCombinedCardFeedsFromAllFeeds(allFeeds: OnyxCollection<CardFeeds> | undefined, includeFeedPredicate?: (feed: CombinedCardFeed) => boolean): CombinedCardFeeds {
    return Object.entries(allFeeds ?? {}).reduce<CombinedCardFeeds>((acc, [onyxKey, feeds]) => {
        const domainID = Number(onyxKey.split('_').at(-1));

        const workspaceFeedsSettings = feeds?.settings;
        const companyCards = workspaceFeedsSettings?.companyCards;

        if (!companyCards) {
            return acc;
        }

        for (const feedName of Object.keys(companyCards) as CompanyCardFeedWithNumber[]) {
            const feedSettings = companyCards?.[feedName];
            const oAuthAccountDetails = workspaceFeedsSettings?.oAuthAccountDetails?.[feedName];
            const customFeedName = workspaceFeedsSettings?.companyCardNicknames?.[feedName];

            if (!domainID) {
                continue;
            }

            const combinedCardFeed = {
                ...feedSettings,
                ...oAuthAccountDetails,
                customFeedName,
                domainID,
                feed: feedName,
            };

            if (includeFeedPredicate && !includeFeedPredicate(combinedCardFeed)) {
                continue;
            }

            const combinedFeedKey = getCompanyCardFeedWithDomainID(feedName, domainID);

            acc[combinedFeedKey] = combinedCardFeed;
        }

        return acc;
    }, {});
}

export type {CardFilterItem, CardFeedNamesWithType, CardFeedForDisplay};
export {
    buildCardsData,
    getCardFeedNamesWithType,
    buildCardFeedsData,
    generateSelectedCards,
    getSelectedCardsFromFeeds,
    createCardFeedKey,
    getCardFeedKey,
    getWorkspaceCardFeedKey,
    generateDomainFeedData,
    getDomainFeedData,
    getCardFeedsForDisplay,
    getCardFeedsForDisplayPerPolicy,
    getCombinedCardFeedsFromAllFeeds,
};
