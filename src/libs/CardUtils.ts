import groupBy from 'lodash/groupBy';
import Onyx from 'react-native-onyx';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import * as Illustrations from '@src/components/Icon/Illustrations';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import type {OnyxValues} from '@src/ONYXKEYS';
import ONYXKEYS from '@src/ONYXKEYS';
import type {BankAccountList, Card, CardList, PersonalDetailsList, WorkspaceCardsList} from '@src/types/onyx';
import type Policy from '@src/types/onyx/Policy';
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
    return Object.values(cardsList ?? {}).sort((cardA: Card, cardB: Card) => {
        const userA = personalDetails?.[cardA.accountID] ?? {};
        const userB = personalDetails?.[cardB.accountID] ?? {};

        const aName = PersonalDetailsUtils.getDisplayNameOrDefault(userA);
        const bName = PersonalDetailsUtils.getDisplayNameOrDefault(userB);

        return localeCompare(aName, bName);
    });
}

function getCardFeedIcon(cardFeed: string): IconAsset {
    if (cardFeed.startsWith(CONST.COMPANY_CARD.FEED_BANK_NAME.MASTER_CARD)) {
        return Illustrations.MasterCardCompanyCards;
    }

    if (cardFeed.startsWith(CONST.COMPANY_CARD.FEED_BANK_NAME.VISA)) {
        return Illustrations.VisaCompanyCards;
    }

    return Illustrations.AmexCompanyCards;
}

function getCardDetailsImage(cardFeed: string): IconAsset {
    if (cardFeed.startsWith(CONST.COMPANY_CARD.FEED_BANK_NAME.MASTER_CARD)) {
        return Illustrations.MasterCardCompanyCardDetail;
    }

    if (cardFeed.startsWith(CONST.COMPANY_CARD.FEED_BANK_NAME.VISA)) {
        return Illustrations.VisaCompanyCardDetail;
    }

    return Illustrations.AmexCardCompanyCardDetail;
}

function getMemberCards(policy: OnyxEntry<Policy>, allCardsList: OnyxCollection<WorkspaceCardsList>, accountID?: number) {
    const workspaceId = policy?.workspaceAccountID ? policy.workspaceAccountID.toString() : '';
    const cards: WorkspaceCardsList = {};
    const mockedCardsList = allCardsList ?? {};
    Object.keys(mockedCardsList)
        .filter((key) => key !== `${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}${workspaceId}_${CONST.EXPENSIFY_CARD.BANK}` && key.includes(workspaceId))
        .forEach((key) => {
            const feedCards = mockedCardsList?.[key];
            if (feedCards && Object.keys(feedCards).length > 0) {
                Object.keys(feedCards).forEach((feedCardKey) => {
                    if (feedCards?.[feedCardKey].accountID !== accountID) {
                        return;
                    }
                    cards[feedCardKey] = feedCards[feedCardKey];
                });
            }
        });
    return cards;
}

export {
    isExpensifyCard,
    isCorporateCard,
    getDomainCards,
    formatCardExpiration,
    getMonthFromExpirationDateString,
    getYearFromExpirationDateString,
    maskCard,
    getCardDescription,
    findPhysicalCard,
    hasDetectedFraud,
    getMCardNumberString,
    getTranslationKeyForLimitType,
    getEligibleBankAccountsForCard,
    sortCardsByCardholderName,
    getCardFeedIcon,
    getCardDetailsImage,
    getMemberCards,
};
