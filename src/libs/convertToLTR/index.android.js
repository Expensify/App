/**
 * Android only - convert RTL text to a LTR text using Unicode controls.
 * https://www.w3.org/International/questions/qa-bidi-unicode-controls
 * @param {String} text
 * @returns {String}
 */
export default function convertToLTR(text) {
    return `\u2066${text}`;
}
