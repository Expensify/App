import lodash from 'lodash';
import Onyx from 'react-native-onyx';
import CONST from '../CONST';
import * as Localize from './Localize';
import * as OnyxTypes from '../types/onyx';
import ONYXKEYS, {OnyxValues} from '../ONYXKEYS';

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
function isExpensifyCard(cardID: number) {
    const card = allCards[cardID];
    if (!card) {
        return false;
    }
    return card.bank === CONST.EXPENSIFY_CARD.BANK;
}

/**
 * @param cardID
 * @returns string in format %<bank> - <lastFourPAN || Not Activated>%.
 */
function getCardDescription(cardID: number) {
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
 * @param cardList - collection of assigned cards
 * @returns collection of assigned cards grouped by domain
 */
function getDomainCards(cardList: Record<string, OnyxTypes.Card>) {
    // eslint-disable-next-line you-dont-need-lodash-underscore/filter
    const activeCards = lodash.filter(cardList, (card) => (CONST.EXPENSIFY_CARD.ACTIVE_STATES as ReadonlyArray<OnyxTypes.Card['state']>).includes(card.state));
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

export {isExpensifyCard, getDomainCards, getMonthFromExpirationDateString, getYearFromExpirationDateString, maskCard, getCardDescription};
