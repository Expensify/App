const VISIBLE_CHARACTERS = 4;

const LETTER_OR_DIGIT = /[\p{L}\p{N}]/gu;

/** The characters a masked value leaves visible: the last four, or at most half of a short value */
function getVisibleEnding(value: string): string {
    return value.slice(value.length - Math.min(VISIBLE_CHARACTERS, Math.floor(value.length / 2)));
}

/** All but the last four characters hidden, as in •••-••-6789, so the user can tell which number they entered. Separators stay, so a formatted value keeps its shape. A short value shows at most half of itself. */
function maskSensitiveValue(value: string): string {
    const ending = getVisibleEnding(value);
    return value.slice(0, value.length - ending.length).replaceAll(LETTER_OR_DIGIT, '•') + ending;
}

export default maskSensitiveValue;
export {getVisibleEnding};
