import {isValidSSNFullNine} from '@libs/ValidationUtils';

const VISIBLE_CHARACTERS = 4;

/** All but the last four characters hidden, as in •••-••-6789, so the user can tell which number they entered */
function maskSensitiveValue(value: string): string {
    const masked = '•'.repeat(Math.max(value.length - VISIBLE_CHARACTERS, 0)) + value.slice(-VISIBLE_CHARACTERS);
    return isValidSSNFullNine(value) ? `${masked.slice(0, 3)}-${masked.slice(3, 5)}-${masked.slice(5)}` : masked;
}

export default maskSensitiveValue;
