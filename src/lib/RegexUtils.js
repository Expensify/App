/**
 * Take the logical union of an arbitrary number of regexes
 * @param {...RegExp} regexes
 * @returns {RegExp}
 */
function union(...regexes) {
    return new RegExp(regexes.map(regex => regex.source).join('|'));
}

export default {
    union,
};
