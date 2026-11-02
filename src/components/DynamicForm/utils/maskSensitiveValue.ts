const VISIBLE_CHARACTERS = 4;

const SSN_FORMAT = /^\d{9}$/;

/** The characters a masked value leaves visible: the last four, or at most half of a short value */
function getVisibleEnding(value: string): string {
    return value.slice(value.length - Math.min(VISIBLE_CHARACTERS, Math.floor(value.length / 2)));
}

/** Whether a value has the nine digits of an SSN. Unlike the SSN validator, it accepts numbers the form can take, such as one starting with 0000. */
function hasSSNFormat(value: string): boolean {
    return SSN_FORMAT.test(value);
}

/** All but the last four characters hidden, as in •••-••-6789, so the user can tell which number they entered. A short value shows at most half of itself. */
function maskSensitiveValue(value: string): string {
    const ending = getVisibleEnding(value);
    const masked = '•'.repeat(value.length - ending.length) + ending;
    return hasSSNFormat(value) ? `${masked.slice(0, 3)}-${masked.slice(3, 5)}-${masked.slice(5)}` : masked;
}

export default maskSensitiveValue;
export {getVisibleEnding};
