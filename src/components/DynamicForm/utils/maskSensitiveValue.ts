import {isValidSSNFullNine} from '@libs/ValidationUtils';

const VISIBLE_CHARACTERS = 4;

/** The characters a masked value leaves visible: the last four, or at most half of a short value */
function getVisibleEnding(value: string): string {
    return value.slice(value.length - Math.min(VISIBLE_CHARACTERS, Math.floor(value.length / 2)));
}

/** All but the last four characters hidden, as in •••-••-6789, so the user can tell which number they entered. A short value shows at most half of itself. */
function maskSensitiveValue(value: string): string {
    const ending = getVisibleEnding(value);
    const masked = '•'.repeat(value.length - ending.length) + ending;
    return isValidSSNFullNine(value) ? `${masked.slice(0, 3)}-${masked.slice(3, 5)}-${masked.slice(5)}` : masked;
}

export default maskSensitiveValue;
export {getVisibleEnding};
