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
 * @param {String} expirationDateString - string in MM/YYYY, MM/YY, MMYY, or MMYYYY format
 * @returns {String}
 */
function getYearFromExpirationDateString(expirationDateString) {
    const cardYear = expirationDateString.includes('/')
        ? expirationDateString.substr(3)
        : expirationDateString.substr(2);

    return cardYear.length === 2 ? `20${cardYear}` : cardYear;
}

export {
    maskCardNumber,
    getMonthFromExpirationDateString,
    getYearFromExpirationDateString,
};
