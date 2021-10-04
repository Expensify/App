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

export {
    // eslint-disable-next-line import/prefer-default-export
    maskCardNumber,
};
