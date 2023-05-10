import Str from 'expensify-common/lib/str';

/**
 * Render a suggestion menu item component.
 * @param {String} name
 * @param {String} prefix
 * @returns {Array}
 */
const getStyledTextArray = (name, prefix) => {
    const texts = [];
    const prefixLowercase = prefix.toLowerCase();
    const prefixLocation = name.search(Str.escapeForRegExp(prefixLowercase));

    if (prefixLocation === 0 && prefix.length === name.length) {
        texts.push({text: prefixLowercase, isColored: true});
    } else if (prefixLocation === 0 && prefix.length !== name.length) {
        texts.push(
            {text: name.slice(0, prefix.length), isColored: true},
            {text: name.slice(prefix.length), isColored: false},
        );
    } else if (prefixLocation > 0 && prefix.length !== name.length) {
        texts.push(
            {text: name.slice(0, prefixLocation), isColored: false},
            {
                text: name.slice(prefixLocation, prefixLocation + prefix.length),
                isColored: true,
            },
            {
                text: name.slice(prefixLocation + prefix.length),
                isColored: false,
            },
        );
    } else {
        texts.push({text: name, isColored: false});
    }
    return texts;
};

export default getStyledTextArray;
