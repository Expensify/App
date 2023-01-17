/* eslint-disable no-bitwise */
/**
 * Simple string hashing function obtained from: https://stackoverflow.com/a/8831937/16434681
 * Returns a hash code from a string
 * @param  {String} str The string to hash.
 * @return {Number} A 32bit integer (can be negative)
 * @see http://werxltd.com/wp/2010/05/13/javascript-implementation-of-javas-string-hashcode-method/
 */
function hashCode(str) {
    let hash = 0;
    for (let i = 0, len = str.length; i < len; i++) {
        const chr = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + chr;
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
}

export default hashCode;
