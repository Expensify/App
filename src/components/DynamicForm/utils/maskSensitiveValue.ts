const VISIBLE_CHARACTERS = 4;

/** Any nine digits get the SSN grouping. The SSN validator is not used here, because the form may accept numbers it rejects, such as one starting with 0000. */
const NINE_DIGITS = /^\d{9}$/;

/** The characters a masked value leaves visible: the last four, or at most half of a short value */
function getVisibleEnding(value: string): string {
    return value.slice(value.length - Math.min(VISIBLE_CHARACTERS, Math.floor(value.length / 2)));
}

/** All but the last four characters hidden, as in •••-••-6789, so the user can tell which number they entered. A short value shows at most half of itself. */
function maskSensitiveValue(value: string): string {
    const ending = getVisibleEnding(value);
    const masked = '•'.repeat(value.length - ending.length) + ending;
    return NINE_DIGITS.test(value) ? `${masked.slice(0, 3)}-${masked.slice(3, 5)}-${masked.slice(5)}` : masked;
}

export default maskSensitiveValue;
export {getVisibleEnding};
