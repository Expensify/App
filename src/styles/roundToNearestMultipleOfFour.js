/**
 * The Expensify.cash repo is very consistent about doing spacing in multiples of 4.
 * In an effort to maintain that consistency, we'll make sure that any distance we're shifting the components
 * are a multiple of 4.
 *
 * @param {Number} n
 * @returns {Number}
 */
function roundToNearestMultipleOfFour(n) {
    if (n > 0) {
        return Math.ceil(n / 4.0) * 4;
    }

    if (n < 0) {
        return Math.floor(n / 4.0) * 4;
    }

    return 0;
}

export default roundToNearestMultipleOfFour;
