import {Card} from '../types/onyx';
import CONST from '../CONST';

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

export {getMonthFromExpirationDateString, getYearFromExpirationDateString, getCompanyCards};
