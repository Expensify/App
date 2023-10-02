import lodash from 'lodash';
import {Card} from '../types/onyx';
import CONST from '../CONST';
import * as OnyxTypes from '../types/onyx';

/**
 * @returns string with a month in MM format
 */
function getMonthFromExpirationDateString(expirationDateString: string) {
    return expirationDateString.substring(0, 2);
}

/**
 * @returns string with a year in YY or YYYY format
 */
function getYearFromExpirationDateString(expirationDateString: string) {
    const stringContainsNumbersOnly = /^\d+$/.test(expirationDateString);
    const cardYear = stringContainsNumbersOnly ? expirationDateString.substring(2) : expirationDateString.substring(3);

    return cardYear.length === 2 ? `20${cardYear}` : cardYear;
}

function getCompanyCards(cardList: {string: Card}) {
    if (!cardList) {
        return [];
    }
    return Object.values(cardList).filter((card) => card.bank !== CONST.EXPENSIFY_CARD.BANK);
}

/**
 * @param cardList - collection of assigned cards
 * @returns collection of assigned cards grouped by domain
 */
function getDomainCards(cardList: Record<string, OnyxTypes.Card>) {
    // eslint-disable-next-line you-dont-need-lodash-underscore/filter
    const activeCards = lodash.filter(cardList, (card) => [2, 3, 4, 7].includes(card.state));
    return lodash.groupBy(activeCards, (card) => card.domainName.toLowerCase());
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

export {getDomainCards, getCompanyCards, getMonthFromExpirationDateString, getYearFromExpirationDateString, maskCard};
