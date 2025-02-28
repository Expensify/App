import type {LocaleContextProps} from '@components/LocaleContextProvider';
import type {AdditionalCardProps} from '@components/SelectionList/Search/CardListItem';
import CONST from '@src/CONST';
import type {Card, CardList, CompanyCardFeed, PersonalDetailsList, WorkspaceCardsList} from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import type {DomainFeedData} from './CardUtils';
import {generateDomainFeedsData, getBankName, getCardFeedIcon, getCardFeedKey, getWorkspaceCardFeedKey, isCard, isCardHiddenFromSearch} from './CardUtils';
import {translateLocal} from './Localize';
import {getDescriptionForPolicyDomainCard, getPolicy} from './PolicyUtils';
import type {OptionData} from './ReportUtils';

type CardFilterItem = Partial<OptionData> & AdditionalCardProps & {isCardFeed?: boolean; correspondingCards?: string[]; cardFeedKey: string};
type ItemsGroupedBySelection = {selected: CardFilterItem[]; unselected: CardFilterItem[]};

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

function createIndividualCardFilterItem(card: Card, personalDetailsList: PersonalDetailsList, selectedCards: string[]): CardFilterItem {
    const personalDetails = personalDetailsList[card?.accountID ?? CONST.DEFAULT_NUMBER_ID];
    const isSelected = selectedCards.includes(card.cardID.toString());
    const icon = getCardFeedIcon(card?.bank as CompanyCardFeed);
    const cardName = card?.nameValuePairs?.cardTitle;
    const text = personalDetails?.displayName ?? cardName;

    return {
        lastFourPAN: card.lastFourPAN,
        isVirtual: card?.nameValuePairs?.isVirtual,
        shouldShowOwnersAvatar: true,
        cardName,
        cardOwnerPersonalDetails: personalDetails ?? undefined,
        text,
        keyForList: card.cardID.toString(),
        isSelected,
        bankIcon: {
            icon,
        },
        isCardFeed: false,
        cardFeedKey: '',
    };
}

function buildIndividualCardsData(
    workspaceCardFeeds: Record<string, WorkspaceCardsList | undefined>,
    userCardList: CardList,
    personalDetailsList: PersonalDetailsList,
    selectedCards: string[],
): ItemsGroupedBySelection {
    const userAssignedCards: CardFilterItem[] = Object.values(userCardList ?? {})
        .filter((card) => !isCardHiddenFromSearch(card))
        .map((card) => createIndividualCardFilterItem(card, personalDetailsList, selectedCards));

    // When user is admin of a workspace he sees all the cards of workspace under cards_ Onyx key
    const allWorkspaceCards: CardFilterItem[] = Object.values(workspaceCardFeeds)
        .filter((cardFeed) => !isEmptyObject(cardFeed))
        .flatMap((cardFeed) => {
            return Object.values(cardFeed as Record<string, Card>)
                .filter((card) => card && isCard(card) && !userCardList?.[card.cardID] && !isCardHiddenFromSearch(card))
                .map((card) => createIndividualCardFilterItem(card, personalDetailsList, selectedCards));
        });

    const allCardItems = [...userAssignedCards, ...allWorkspaceCards];
    const selectedCardItems: CardFilterItem[] = [];
    const unselectedCardItems: CardFilterItem[] = [];
    allCardItems.forEach((card) => {
        if (card.isSelected) {
            selectedCardItems.push(card);
        } else {
            unselectedCardItems.push(card);
        }
    });
    return {selected: selectedCardItems, unselected: unselectedCardItems};
}

type CardFeedData = {cardName: string; bank: string; label?: string};

function getWorkspaceFeedData(cardFeed: WorkspaceCardsList | undefined, repeatingBanks: string[], translate: LocaleContextProps['translate']): CardFeedData | undefined {
    const cardFeedArray = Object.values(cardFeed ?? {});
    const representativeCard = cardFeedArray.find((cardFeedItem) => isCard(cardFeedItem));
    if (!representativeCard || !cardFeedArray.some((cardFeedItem) => isCard(cardFeedItem) && !isCardHiddenFromSearch(cardFeedItem))) {
        return;
    }
    const {domainName, bank} = representativeCard;
    const isBankRepeating = repeatingBanks.includes(bank);
    const policyID = domainName.match(CONST.REGEX.EXPENSIFY_POLICY_DOMAIN_NAME)?.[1] ?? '';
    const correspondingPolicy = getPolicy(policyID?.toUpperCase());
    const cardFeedLabel = isBankRepeating ? correspondingPolicy?.name : undefined;
    const cardFeedBankName = bank === CONST.EXPENSIFY_CARD.BANK ? translate('search.filters.card.expensify') : getBankName(bank as CompanyCardFeed);
    const cardName = translate('search.filters.card.cardFeedName', {cardFeedBankName, cardFeedLabel});
    return {
        cardName,
        bank,
        label: cardFeedLabel,
    };
}

function getDomainFeedData(domainFeed: DomainFeedData, repeatingBanks: string[], translate: LocaleContextProps['translate']): CardFeedData {
    const {domainName, bank} = domainFeed;
    const isBankRepeating = repeatingBanks.includes(bank);
    const cardFeedBankName = bank === CONST.EXPENSIFY_CARD.BANK ? translate('search.filters.card.expensify') : getBankName(bank as CompanyCardFeed);
    const cardFeedLabel = isBankRepeating ? getDescriptionForPolicyDomainCard(domainName) : undefined;
    const cardName = translate('search.filters.card.cardFeedName', {cardFeedBankName, cardFeedLabel});
    return {
        cardName,
        bank,
        label: cardFeedLabel,
    };
}

type GetCardFeedData = {
    workspaceCardFeeds: Record<string, WorkspaceCardsList | undefined>;
    userCardList: CardList;
    translate?: LocaleContextProps['translate'];
};

function getCardFeedsData({workspaceCardFeeds, userCardList, translate: propsTranslate}: GetCardFeedData) {
    const domainFeeds = generateDomainFeedsData(userCardList);
    const repeatingBanks = getRepeatingBanks(Object.keys(workspaceCardFeeds), domainFeeds);
    const data: Record<string, CardFeedData> = {};
    const translate = propsTranslate ?? translateLocal;

    Object.entries(workspaceCardFeeds)
        .filter(([, cardFeed]) => !isEmptyObject(cardFeed))
        .forEach(([cardFeedKey, cardFeed]) => {
            const workspaceData = getWorkspaceFeedData(cardFeed, repeatingBanks, translate);
            if (workspaceData) {
                data[cardFeedKey] = workspaceData;
            }
        });

    Object.values(domainFeeds).forEach((domainFeed) => {
        data[`${domainFeed.fundID}_${domainFeed.bank}`] = getDomainFeedData(domainFeed, repeatingBanks, translate);
    });

    return data;
}

/* eslint-disable no-param-reassign */
function getCardFeedNames(params: GetCardFeedData) {
    const data = getCardFeedsData(params);
    return Object.keys(data).reduce<Record<string, string>>((result, key) => {
        result[key] = data[key].cardName;
        return result;
    }, {});
}
/* eslint-enable no-param-reassign */

function createCardFeedItem({
    cardName,
    bank,
    keyForList,
    cardFeedKey,
    correspondingCardIDs,
    selectedCards,
}: {
    cardName: string;
    bank: string;
    keyForList: string;
    cardFeedKey: string;
    correspondingCardIDs: string[];
    selectedCards: string[];
}): CardFilterItem {
    const isSelected = correspondingCardIDs.every((card) => selectedCards.includes(card));

    const icon = getCardFeedIcon(bank as CompanyCardFeed);
    return {
        text: cardName,
        keyForList,
        isSelected,
        shouldShowOwnersAvatar: false,
        bankIcon: {
            icon,
        },
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
): ItemsGroupedBySelection {
    const selectedFeeds: CardFilterItem[] = [];
    const unselectedFeeds: CardFilterItem[] = [];
    const repeatingBanks = getRepeatingBanks(Object.keys(workspaceCardFeeds), domainFeedsData);

    Object.values(domainFeedsData).forEach((domainFeed) => {
        const {domainName, bank, correspondingCardIDs} = domainFeed;

        const feedKey = `${domainFeed.fundID}_${bank}`;
        const {cardName} = getDomainFeedData(domainFeed, repeatingBanks, translate);

        const feedItem = createCardFeedItem({
            cardName,
            bank,
            correspondingCardIDs,
            keyForList: `${domainName}-${bank}`,
            cardFeedKey: feedKey,
            selectedCards,
        });
        if (feedItem.isSelected) {
            selectedFeeds.push(feedItem);
        } else {
            unselectedFeeds.push(feedItem);
        }
    });

    Object.entries(workspaceCardFeeds)
        .filter(([, cardFeed]) => !isEmptyObject(cardFeed))
        .forEach(([cardFeedKey, cardFeed]) => {
            const correspondingCardIDs = Object.entries(cardFeed ?? {})
                .filter(([cardKey, card]) => cardKey !== 'cardList' && isCard(card) && !isCardHiddenFromSearch(card))
                .map(([cardKey]) => cardKey);

            const workspaceData = getWorkspaceFeedData(cardFeed, repeatingBanks, translate);
            if (!workspaceData) {
                return;
            }
            const {cardName, bank} = workspaceData;

            const feedItem = createCardFeedItem({
                cardName,
                bank,
                correspondingCardIDs,
                cardFeedKey: getCardFeedKey(workspaceCardFeeds, cardFeedKey),
                keyForList: cardFeedKey,
                selectedCards,
            });
            if (feedItem.isSelected) {
                selectedFeeds.push(feedItem);
            } else {
                unselectedFeeds.push(feedItem);
            }
        });

    return {selected: selectedFeeds, unselected: unselectedFeeds};
}

function getSelectedCardsFromFeeds(workspaceCardFeeds?: Record<string, WorkspaceCardsList | undefined>, selectedFeeds?: string[]): string[] {
    if (!workspaceCardFeeds || !selectedFeeds) {
        return [];
    }

    const selectedCards = selectedFeeds.flatMap((feedId) => {
        const feed = workspaceCardFeeds[getWorkspaceCardFeedKey(feedId)];
        if (!feed) {
            return [];
        }

        return Object.keys(feed).filter((cardNumber) => feed[cardNumber].state !== CONST.EXPENSIFY_CARD.STATE.STATE_NOT_ISSUED);
    });

    return [...new Set(selectedCards)];
}

const generateSelectedCards = (workspaceCardFeeds: Record<string, WorkspaceCardsList | undefined> | undefined, feeds: string[] | undefined, cards: string[] | undefined) => {
    const selectedCards = getSelectedCardsFromFeeds(workspaceCardFeeds, feeds);
    return [...new Set([...selectedCards, ...(cards ?? [])])];
};

export type {CardFilterItem, ItemsGroupedBySelection};
export {buildIndividualCardsData, getCardFeedNames, buildCardFeedsData, generateSelectedCards, getSelectedCardsFromFeeds};
