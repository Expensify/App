"use strict";
/*
 * Note: This file is separated from StringUtils because it is imported by a ts-node script.
 *       ts-node scripts can't import react-native (because it is written in flow),
 *       and StringUtils indirectly imports react-native.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = hash;
/**
 * Hash a string, plus some logic to increase entropy and reduce collisions.
 *
 * @param str - the string to generate a whole number hash from
 * @param max - the hash will not be more than this maximum. It defaults to 2^32 to prevent the hash from overflowing the max number space in JavaScript, which is 2^53
 *
 * @example
 * // deterministically choose an item from an array with an even distribution:
 * const avatars = [Avatar1, Avatar2, Avatar3, Avatar4];
 * const email = 'someone@gmail.com';
 * const defaultAvatarForEmail = avatars[StringUtils.hash(email, avatars.length)];
 */
function hash(str, max) {
    if (max === void 0) { max = Math.pow(2, 32); }
    if (max <= 0) {
        throw new Error('max must be a positive integer');
    }
    // Create a rolling hash from the characters
    var hashCode = 0;
    for (var i = 0; i < str.length; i++) {
        // Char code, weighted by position in the string (this way "act" and "cat" will produce different hashes)
        var charCode = str.charCodeAt(i) * (i + 1);
        // Multiplied and offset by prime numbers for more even distribution.
        hashCode *= 31;
        hashCode += charCode + 7;
        // Continuously mod by the max to prevent max number overflow for large strings
        hashCode %= max;
    }
    return Math.abs(hashCode);
}
