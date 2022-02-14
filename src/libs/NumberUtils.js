/**
 * @param {Number} num
 * @returns {Boolean}
 */
function isWholeNumber(num) {
    if (!Number.isInteger(num)) {
        return false;
    }

    return num >= 0;
}

export {
    // eslint-disable-next-line import/prefer-default-export
    isWholeNumber,
};
