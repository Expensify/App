import CONST from '../CONST';

/**
 * Generates a random positive 64 bit numeric string by randomly generating the left, middle, and right parts and concatenating them. Used to generate client-side ids.
 * @returns {String} string representation of a randomly generated 64 bit signed integer
 */
function rand64() {
    // Max 64-bit signed:
    // 9,223,372,036,854,775,807
    // The left part of the max 64-bit number *+1* because we're flooring it.
    const left = Math.floor(Math.random() * (CONST.MAX_64BIT_LEFT_PART + 1));

    let middle;
    let right;

    // If the left is any number but the highest possible, we can actually have any value for the middle part, because even if it's all `9`s, the final value will not overflow the maximum
    // 64-bit number.
    if (left !== CONST.MAX_64BIT_LEFT_PART) {
        middle = Math.floor(Math.random() * CONST.MAX_INT_FOR_RANDOM_7_DIGIT_VALUE);
    } else {
        middle = Math.floor(Math.random() * (CONST.MAX_64BIT_MIDDLE_PART + 1));
    }

    // And unless both the left and middle parts were the maximums, the right part can be any value as well.
    if (left !== CONST.MAX_64BIT_LEFT_PART || middle !== CONST.MAX_64BIT_MIDDLE_PART) {
        right = Math.floor(Math.random() * CONST.MAX_INT_FOR_RANDOM_7_DIGIT_VALUE);
    } else {
        right = Math.floor(Math.random() * (CONST.MAX_64BIT_RIGHT_PART + 1));
    }

    // Pad the middle and right with zeros.
    const middleString = middle.toString().padStart(7, '0');
    const rightString = right.toString().padStart(7, '0');

    return left + middleString + rightString;
}

/**
 * @returns {Number}
 */
function generateReportActionClientID() {
    // Generate a clientID so we can save the optimistic action to storage with the clientID as key. Later, we will
    // remove the optimistic action when we add the real action created in the server. We do this because it's not
    // safe to assume that this will use the very next sequenceNumber. An action created by another can overwrite that
    // sequenceNumber if it is created before this one. We use a combination of current epoch timestamp (milliseconds)
    // and a random number so that the probability of someone else having the same clientID is
    // extremely low even if they left the comment at the same moment as another user on the same report. The random
    // number is 3 digits because if we go any higher JS will convert the digits after the 16th position to 0's in
    // clientID.
    const randomNumber = Math.floor((Math.random() * (999 - 100)) + 100);
    return parseInt(`${Date.now()}${randomNumber}`, 10);
}

export {
    rand64,
    generateReportActionClientID,
};
