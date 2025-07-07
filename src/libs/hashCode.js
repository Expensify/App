"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable no-bitwise */
/**
 * Simple string hashing function obtained from: https://stackoverflow.com/a/8831937/16434681
 * Returns a hash code from a string
 * @param str The string to hash.
 * @return A 32bit integer (can be negative)
 * @see http://werxltd.com/wp/2010/05/13/javascript-implementation-of-javas-string-hashcode-method/
 */
function hashCode(str) {
    var hash = 0;
    for (var i = 0, len = str.length; i < len; i++) {
        var chr = str.charCodeAt(i);
        hash = (hash << 5) - hash + chr;
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
}
exports.default = hashCode;
