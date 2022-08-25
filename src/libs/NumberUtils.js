import CONST from '../CONST';

/**
 * Generates a random positive 64 bit numeric string by randomly generating the left half and right half and concatenating them. Used to generate client-side ids.
 * @returns {String} string representation of a randomly generated 64 bit signed integer
 */
/* eslint-disable no-unused-vars */
function rand64() {
    // Max 64-bit signed:
    // 9,223,372,036,854,775,807
    // The left part of the max 64-bit number *+1* because we're flooring it
    const left = Math.floor(Math.random() * (CONST.MAX_64BIT_LEFT_HALF + 1));

    // The right part of the max 64-bit number *+1* for the same reason
    let right;

    // If the top is any number but the highest one, we can actually have any value for the rest
    if (left !== CONST.MAX_64BIT_LEFT_HALF) {
        right = Math.floor(Math.random() * 1000000000);
    } else {
        right = Math.floor(Math.random() * (CONST.MAX_64BIT_RIGHT_HALF + 1));
    }

    // Pad the right with zeros
    const rightString = right.toString().padStart(9, '0');

    return left + rightString;
}

export {
    // eslint-disable-next-line import/prefer-default-export
    rand64,
};
