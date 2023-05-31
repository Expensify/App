/**
 * Returns the masked card number (ex: 4242XXXXXXXX4242)
 *
 * @param {String} cardNumber
 * @return {Boolean}
 */
function maskCardNumber(cardNumber) {
    const firstFour = cardNumber.substring(0, 4);
    const lastFour = cardNumber.substring(cardNumber.length - 4);

    return `${firstFour}${'X'.repeat(cardNumber.length - 8)}${lastFour}`;
}

/**
 * @param {String} expirationDateString - string in MM/YYYY, MM/YY, MMYY, or MMYYYY format
 * @returns {String}
 */
function getMonthFromExpirationDateString(expirationDateString) {
    return expirationDateString.substr(0, 2);
}

/**
 * @param {String} expirationDateString - string in MMYY or MMYYYY format, with any non-number separator
 * @returns {String}
 */
function getYearFromExpirationDateString(expirationDateString) {
    const stringContainsNumbersOnly = /^\d+$/.test(expirationDateString);
    const cardYear = stringContainsNumbersOnly ? expirationDateString.substr(2) : expirationDateString.substr(3);

    return cardYear.length === 2 ? `20${cardYear}` : cardYear;
}

export {maskCardNumber, getMonthFromExpirationDateString, getYearFromExpirationDateString};
