import lodash from 'lodash';
import Onyx from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import CONST from '@src/CONST';
import type {OnyxValues} from '@src/ONYXKEYS';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Card, CardList} from '@src/types/onyx';
import * as Localize from './Localize';

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

    return lodash.groupBy(activeCards, (card) => card.domainName);
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
    return cards.find((card) => !card.nameValuePairs?.isVirtual);
}

/**
 * Checks if any of the cards in the list have detected fraud
 *
 * @param cardList - collection of assigned cards
 */
function hasDetectedFraud(cardList: Record<string, Card>): boolean {
    return Object.values(cardList).some((card) => card.fraud !== CONST.EXPENSIFY_CARD.FRAUD_TYPES.NONE);
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
};
