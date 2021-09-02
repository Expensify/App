/* eslint radix: ["error", "as-needed"] */

/**
 * getEmojiUnicode
 * Get the unicode code of an emoji in base 16.
 *
 * @name emojiUnicode
 * @function
 * @param {String} input The emoji character.
 * @returns {String} The base 16 unicode code.
 */
export default function getEmojiUnicode(input) {
    return getEmojiUnicode.raw(input).split(' ').map(val => parseInt(val).toString(16)).join(' ');
}

/**
 * getEmojiUnicode.raw
 * Get the unicode code points of an emoji in base 16.
 *
 * @name getEmojiUnicode.raw
 * @function
 * @param {String} input The emoji character.
 * @returns {String} The unicode code points.
 */
getEmojiUnicode.raw = function (input) {
    if (input.length === 1) {
        return input.charCodeAt(0).toString();
    }
    if (input.length > 1) {
        const pairs = [];
        for (let i = 0; i < input.length; i++) {
            if (
                // high surrogate
                input.charCodeAt(i) >= 0xd800 && input.charCodeAt(i) <= 0xdbff
            ) {
                if (
                    input.charCodeAt(i + 1) >= 0xdc00 && input.charCodeAt(i + 1) <= 0xdfff
                ) {
                    // low surrogate
                    pairs.push(
                        ((input.charCodeAt(i) - 0xd800) * 0x400)
                      + (input.charCodeAt(i + 1) - 0xdc00) + 0x10000,
                    );
                }
            } else if (input.charCodeAt(i) < 0xd800 || input.charCodeAt(i) > 0xdfff) {
                // modifiers and joiners
                pairs.push(input.charCodeAt(i));
            }
        }
        return pairs.join(' ');
    }

    return '';
};
