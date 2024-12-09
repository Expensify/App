import groupBy from 'lodash/groupBy';
import Onyx from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import ExpensifyCardImage from '@assets/images/expensify-card.svg';
import * as Illustrations from '@src/components/Icon/Illustrations';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import type {OnyxValues} from '@src/ONYXKEYS';
import ONYXKEYS from '@src/ONYXKEYS';
import type {BankAccountList, Card, CardFeeds, CardList, CompanyCardFeed, PersonalDetailsList, WorkspaceCardsList} from '@src/types/onyx';
import type {FilteredCardList} from '@src/types/onyx/Card';
import type {CompanyCardNicknames, CompanyFeeds, DirectCardFeedData} from '@src/types/onyx/CardFeeds';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import type IconAsset from '@src/types/utils/IconAsset';
import localeCompare from './LocaleCompare';
import * as Localize from './Localize';
import * as PersonalDetailsUtils from './PersonalDetailsUtils';

let allCards: OnyxValues[typeof ONYXKEYS.CARD_LIST] = {};
Onyx.connect({
    key: ONYXKEYS.CARD_LIST,
    callback: (val) => {
        if (!val || Object.keys(val).length === 0) {
            return;
        }

        allCards = val;
    },
});

/**
 * @returns string with a month in MM format
 */
function getMonthFromExpirationDateString(expirationDateString: string) {
    return expirationDateString.substring(0, 2);
}

/**
 * @param cardID
 * @returns boolean
 */
function isExpensifyCard(cardID?: number) {
    if (!cardID) {
        return false;
    }
    const card = allCards[cardID];
    if (!card) {
        return false;
    }
    return card.bank === CONST.EXPENSIFY_CARD.BANK;
}

/**
 * @param cardID
 * @returns boolean if the cardID is in the cardList from ONYX. Includes Expensify Cards.
 */
function isCorporateCard(cardID: number) {
    return !!allCards[cardID];
}

/**
 * @param cardID
 * @returns string in format %<bank> - <lastFourPAN || Not Activated>%.
 */
function getCardDescription(cardID?: number) {
    if (!cardID) {
        return '';
    }
    const card = allCards[cardID];
    if (!card) {
        return '';
    }
    const cardDescriptor = card.state === CONST.EXPENSIFY_CARD.STATE.NOT_ACTIVATED ? Localize.translateLocal('cardTransactions.notActivated') : card.lastFourPAN;
    return cardDescriptor ? `${card.bank} - ${cardDescriptor}` : `${card.bank}`;
}

/**
 * @returns string with a year in YY or YYYY format
 */
function getYearFromExpirationDateString(expirationDateString: string) {
    const stringContainsNumbersOnly = /^\d+$/.test(expirationDateString);
    const cardYear = stringContainsNumbersOnly ? expirationDateString.substring(2) : expirationDateString.substring(3);

    return cardYear.length === 2 ? `20${cardYear}` : cardYear;
}

/**
 * @returns string with a month in MM/YYYY format
 */
function formatCardExpiration(expirationDateString: string) {
    // already matches MM/YYYY format
    const dateFormat = /^\d{2}\/\d{4}$/;
    if (dateFormat.test(expirationDateString)) {
        return expirationDateString;
    }

    const expirationMonth = getMonthFromExpirationDateString(expirationDateString);
    const expirationYear = getYearFromExpirationDateString(expirationDateString);

    return `${expirationMonth}/${expirationYear}`;
}

/**
 * @param cardList - collection of assigned cards
 * @returns collection of assigned cards grouped by domain
 */
function getDomainCards(cardList: OnyxEntry<CardList>): Record<string, Card[]> {
    // Check for domainName to filter out personal credit cards.
    const activeCards = Object.values(cardList ?? {}).filter((card) => !!card?.domainName && CONST.EXPENSIFY_CARD.ACTIVE_STATES.some((element) => element === card.state));

    return groupBy(activeCards, (card) => card.domainName);
}

/**
 * Returns a masked credit card string with spaces for every four symbols.
 * If the last four digits are provided, all preceding digits will be masked.
 * If not, the entire card string will be masked.
 *
 * @param [lastFour=""] - The last four digits of the card (optional).
 * @returns - The masked card string.
 */
function maskCard(lastFour = ''): string {
    const totalDigits = 16;
    const maskedLength = totalDigits - lastFour.length;

    // Create a string with '•' repeated for the masked portion
    const maskedString = '•'.repeat(maskedLength) + lastFour;

    // Insert space for every four symbols
    return maskedString.replace(/(.{4})/g, '$1 ').trim();
}

/**
 * Returns a masked credit card string.
 * Converts given 'X' to '•' for the entire card string.
 *
 * @param cardName - card name with XXXX in the middle.
 * @param feed - card feed.
 * @returns - The masked card string.
 */
function maskCardNumber(cardName: string, feed: string | undefined): string {
    if (!cardName || cardName === '') {
        return '';
    }
    const hasSpace = /\s/.test(cardName);
    const maskedString = cardName.replace(/X/g, '•');
    const isAmexBank = [CONST.COMPANY_CARD.FEED_BANK_NAME.AMEX, CONST.COMPANY_CARD.FEED_BANK_NAME.AMEX_DIRECT].some((value) => value === feed);

    if (hasSpace) {
        return cardName;
    }

    if (isAmexBank && maskedString.length === 15) {
        return maskedString.replace(/(.{4})(.{6})(.{5})/, '$1 $2 $3');
    }

    return maskedString.replace(/(.{4})/g, '$1 ').trim();
}

/**
 * Finds physical card in a list of cards
 *
 * @returns a physical card object (or undefined if none is found)
 */
function findPhysicalCard(cards: Card[]) {
    return cards.find((card) => !card?.nameValuePairs?.isVirtual);
}

/**
 * Checks if any of the cards in the list have detected fraud
 *
 * @param cardList - collection of assigned cards
 */
function hasDetectedFraud(cardList: Record<string, Card>): boolean {
    return Object.values(cardList).some((card) => card.fraud !== CONST.EXPENSIFY_CARD.FRAUD_TYPES.NONE);
}

function getMCardNumberString(cardNumber: string): string {
    return cardNumber.replace(/\s/g, '');
}

function getTranslationKeyForLimitType(limitType: ValueOf<typeof CONST.EXPENSIFY_CARD.LIMIT_TYPES> | undefined): TranslationPaths | '' {
    switch (limitType) {
        case CONST.EXPENSIFY_CARD.LIMIT_TYPES.SMART:
            return 'workspace.card.issueNewCard.smartLimit';
        case CONST.EXPENSIFY_CARD.LIMIT_TYPES.FIXED:
            return 'workspace.card.issueNewCard.fixedAmount';
        case CONST.EXPENSIFY_CARD.LIMIT_TYPES.MONTHLY:
            return 'workspace.card.issueNewCard.monthly';
        default:
            return '';
    }
}

function getEligibleBankAccountsForCard(bankAccountsList: OnyxEntry<BankAccountList>) {
    if (!bankAccountsList || isEmptyObject(bankAccountsList)) {
        return [];
    }
    return Object.values(bankAccountsList).filter((bankAccount) => bankAccount?.accountData?.type === CONST.BANK_ACCOUNT.TYPE.BUSINESS && bankAccount?.accountData?.allowDebit);
}

function sortCardsByCardholderName(cardsList: OnyxEntry<WorkspaceCardsList>, personalDetails: OnyxEntry<PersonalDetailsList>): Card[] {
    const {cardList, ...cards} = cardsList ?? {};
    return Object.values(cards).sort((cardA: Card, cardB: Card) => {
        const userA = personalDetails?.[cardA.accountID ?? '-1'] ?? {};
        const userB = personalDetails?.[cardB.accountID ?? '-1'] ?? {};

        const aName = PersonalDetailsUtils.getDisplayNameOrDefault(userA);
        const bName = PersonalDetailsUtils.getDisplayNameOrDefault(userB);

        return localeCompare(aName, bName);
    });
}

function getCardFeedIcon(cardFeed: CompanyCardFeed | typeof CONST.EXPENSIFY_CARD.BANK): IconAsset {
    const feedIcons = {
        [CONST.COMPANY_CARD.FEED_BANK_NAME.VISA]: Illustrations.VisaCompanyCardDetailLarge,
        [CONST.COMPANY_CARD.FEED_BANK_NAME.AMEX]: Illustrations.AmexCardCompanyCardDetailLarge,
        [CONST.COMPANY_CARD.FEED_BANK_NAME.MASTER_CARD]: Illustrations.MasterCardCompanyCardDetailLarge,
        [CONST.COMPANY_CARD.FEED_BANK_NAME.AMEX_DIRECT]: Illustrations.AmexCardCompanyCardDetailLarge,
        [CONST.COMPANY_CARD.FEED_BANK_NAME.BANK_OF_AMERICA]: Illustrations.BankOfAmericaCompanyCardDetailLarge,
        [CONST.COMPANY_CARD.FEED_BANK_NAME.CAPITAL_ONE]: Illustrations.CapitalOneCompanyCardDetailLarge,
        [CONST.COMPANY_CARD.FEED_BANK_NAME.CHASE]: Illustrations.ChaseCompanyCardDetailLarge,
        [CONST.COMPANY_CARD.FEED_BANK_NAME.CITIBANK]: Illustrations.CitibankCompanyCardDetailLarge,
        [CONST.COMPANY_CARD.FEED_BANK_NAME.WELLS_FARGO]: Illustrations.WellsFargoCompanyCardDetailLarge,
        [CONST.COMPANY_CARD.FEED_BANK_NAME.BREX]: Illustrations.BrexCompanyCardDetailLarge,
        [CONST.COMPANY_CARD.FEED_BANK_NAME.STRIPE]: Illustrations.StripeCompanyCardDetailLarge,
        [CONST.EXPENSIFY_CARD.BANK]: ExpensifyCardImage,
    };

    if (cardFeed.startsWith(CONST.EXPENSIFY_CARD.BANK)) {
        return ExpensifyCardImage;
    }

    if (feedIcons[cardFeed]) {
        return feedIcons[cardFeed];
    }

    // In existing OldDot setups other variations of feeds could exist, ex: vcf2, vcf3, cdfbmo
    const feedKey = (Object.keys(feedIcons) as CompanyCardFeed[]).find((feed) => cardFeed.startsWith(feed));

    if (feedKey) {
        return feedIcons[feedKey];
    }

    return Illustrations.AmexCompanyCards;
}

function isCustomFeed(feed: CompanyCardFeed): boolean {
    return [CONST.COMPANY_CARD.FEED_BANK_NAME.MASTER_CARD, CONST.COMPANY_CARD.FEED_BANK_NAME.VISA, CONST.COMPANY_CARD.FEED_BANK_NAME.AMEX].some((value) => value === feed);
}

function getCompanyFeeds(cardFeeds: OnyxEntry<CardFeeds>): CompanyFeeds {
    return {...cardFeeds?.settings?.companyCards, ...cardFeeds?.settings?.oAuthAccountDetails};
}

function removeExpensifyCardFromCompanyCards(cardFeeds: OnyxEntry<CardFeeds>): CompanyFeeds {
    if (!cardFeeds) {
        return {};
    }

    const companyCards = getCompanyFeeds(cardFeeds);
    return Object.fromEntries(Object.entries(companyCards).filter(([key]) => key !== CONST.EXPENSIFY_CARD.BANK));
}

function getCardFeedName(feedType: CompanyCardFeed): string {
    const feedNamesMapping = {
        [CONST.COMPANY_CARD.FEED_BANK_NAME.VISA]: 'Visa',
        [CONST.COMPANY_CARD.FEED_BANK_NAME.MASTER_CARD]: 'Mastercard',
        [CONST.COMPANY_CARD.FEED_BANK_NAME.AMEX]: 'American Express',
        [CONST.COMPANY_CARD.FEED_BANK_NAME.STRIPE]: 'Stripe',
        [CONST.COMPANY_CARD.FEED_BANK_NAME.AMEX_DIRECT]: 'American Express',
        [CONST.COMPANY_CARD.FEED_BANK_NAME.BANK_OF_AMERICA]: 'Bank of America',
        [CONST.COMPANY_CARD.FEED_BANK_NAME.CAPITAL_ONE]: 'Capital One',
        [CONST.COMPANY_CARD.FEED_BANK_NAME.CHASE]: 'Chase',
        [CONST.COMPANY_CARD.FEED_BANK_NAME.CITIBANK]: 'Citibank',
        [CONST.COMPANY_CARD.FEED_BANK_NAME.WELLS_FARGO]: 'Wells Fargo',
        [CONST.COMPANY_CARD.FEED_BANK_NAME.BREX]: 'Brex',
    };

    // In existing OldDot setups other variations of feeds could exist, ex: vcf2, vcf3, oauth.americanexpressfdx.com 2003
    const feedKey = (Object.keys(feedNamesMapping) as CompanyCardFeed[]).find((feed) => feedType.startsWith(feed));

    if (!feedKey) {
        return '';
    }

    return feedNamesMapping[feedKey];
}

const getBankCardDetailsImage = (bank: ValueOf<typeof CONST.COMPANY_CARDS.BANKS>): IconAsset => {
    const iconMap: Record<ValueOf<typeof CONST.COMPANY_CARDS.BANKS>, IconAsset> = {
        [CONST.COMPANY_CARDS.BANKS.AMEX]: Illustrations.AmexCardCompanyCardDetail,
        [CONST.COMPANY_CARDS.BANKS.BANK_OF_AMERICA]: Illustrations.BankOfAmericaCompanyCardDetail,
        [CONST.COMPANY_CARDS.BANKS.CAPITAL_ONE]: Illustrations.CapitalOneCompanyCardDetail,
        [CONST.COMPANY_CARDS.BANKS.CHASE]: Illustrations.ChaseCompanyCardDetail,
        [CONST.COMPANY_CARDS.BANKS.CITI_BANK]: Illustrations.CitibankCompanyCardDetail,
        [CONST.COMPANY_CARDS.BANKS.WELLS_FARGO]: Illustrations.WellsFargoCompanyCardDetail,
        [CONST.COMPANY_CARDS.BANKS.BREX]: Illustrations.BrexCompanyCardDetail,
        [CONST.COMPANY_CARDS.BANKS.STRIPE]: Illustrations.StripeCompanyCardDetail,
        [CONST.COMPANY_CARDS.BANKS.OTHER]: Illustrations.OtherCompanyCardDetail,
    };
    return iconMap[bank];
};

function getCustomOrFormattedFeedName(feed?: CompanyCardFeed, companyCardNicknames?: CompanyCardNicknames): string | undefined {
    if (!feed) {
        return;
    }

    const customFeedName = companyCardNicknames?.[feed];
    const formattedFeedName = Localize.translateLocal('workspace.companyCards.feedName', {feedName: getCardFeedName(feed)});
    return customFeedName ?? formattedFeedName;
}

// We will simplify the logic below once we have #50450 #50451 implemented
const getCorrectStepForSelectedBank = (selectedBank: ValueOf<typeof CONST.COMPANY_CARDS.BANKS>) => {
    const banksWithFeedType = [
        CONST.COMPANY_CARDS.BANKS.BANK_OF_AMERICA,
        CONST.COMPANY_CARDS.BANKS.CAPITAL_ONE,
        CONST.COMPANY_CARDS.BANKS.CHASE,
        CONST.COMPANY_CARDS.BANKS.CITI_BANK,
        CONST.COMPANY_CARDS.BANKS.WELLS_FARGO,
    ];

    if (selectedBank === CONST.COMPANY_CARDS.BANKS.STRIPE) {
        return CONST.COMPANY_CARDS.STEP.CARD_INSTRUCTIONS;
    }

    if (selectedBank === CONST.COMPANY_CARDS.BANKS.AMEX) {
        return CONST.COMPANY_CARDS.STEP.AMEX_CUSTOM_FEED;
    }

    if (selectedBank === CONST.COMPANY_CARDS.BANKS.BREX) {
        return CONST.COMPANY_CARDS.STEP.BANK_CONNECTION;
    }

    if (selectedBank === CONST.COMPANY_CARDS.BANKS.OTHER) {
        return CONST.COMPANY_CARDS.STEP.CARD_TYPE;
    }

    if (banksWithFeedType.includes(selectedBank)) {
        return CONST.COMPANY_CARDS.STEP.SELECT_FEED_TYPE;
    }

    return CONST.COMPANY_CARDS.STEP.CARD_TYPE;
};

function getSelectedFeed(lastSelectedFeed: OnyxEntry<CompanyCardFeed>, cardFeeds: OnyxEntry<CardFeeds>): CompanyCardFeed | undefined {
    const defaultFeed = Object.keys(removeExpensifyCardFromCompanyCards(cardFeeds)).at(0) as CompanyCardFeed | undefined;
    return lastSelectedFeed ?? defaultFeed;
}

/** Returns list of cards which can be assigned */
function getFilteredCardList(list: WorkspaceCardsList | undefined, directFeed: DirectCardFeedData | undefined) {
    const {cardList: customFeedCardsToAssign, ...cards} = list ?? {};
    const assignedCards = Object.values(cards).map((card) => card.cardName);

    if (directFeed) {
        const unassignedDirectFeedCards = directFeed.accountList.filter((cardNumber) => !assignedCards.includes(cardNumber));
        return Object.fromEntries(unassignedDirectFeedCards.map((cardNumber) => [cardNumber, cardNumber]));
    }

    return Object.fromEntries(Object.entries(customFeedCardsToAssign ?? {}).filter(([cardNumber]) => !assignedCards.includes(cardNumber)));
}

function hasOnlyOneCardToAssign(list: FilteredCardList) {
    return Object.keys(list).length === 1;
}

function getDefaultCardName(cardholder?: string) {
    if (!cardholder) {
        return '';
    }
    return `${cardholder}'s card`;
}

function checkIfNewFeedConnected(prevFeedsData: CompanyFeeds, currentFeedsData: CompanyFeeds) {
    const prevFeeds = Object.keys(prevFeedsData);
    const currentFeeds = Object.keys(currentFeedsData);

    return {
        isNewFeedConnected: currentFeeds.length > prevFeeds.length,
        newFeed: currentFeeds.find((feed) => !prevFeeds.includes(feed)) as CompanyCardFeed | undefined,
    };
}

export {
    isExpensifyCard,
    isCorporateCard,
    getDomainCards,
    formatCardExpiration,
    getMonthFromExpirationDateString,
    getYearFromExpirationDateString,
    maskCard,
    maskCardNumber,
    getCardDescription,
    findPhysicalCard,
    hasDetectedFraud,
    getMCardNumberString,
    getTranslationKeyForLimitType,
    getEligibleBankAccountsForCard,
    sortCardsByCardholderName,
    getCardFeedIcon,
    getCardFeedName,
    getCompanyFeeds,
    isCustomFeed,
    getBankCardDetailsImage,
    getSelectedFeed,
    getCorrectStepForSelectedBank,
    getCustomOrFormattedFeedName,
    removeExpensifyCardFromCompanyCards,
    getFilteredCardList,
    hasOnlyOneCardToAssign,
    checkIfNewFeedConnected,
    getDefaultCardName,
};
