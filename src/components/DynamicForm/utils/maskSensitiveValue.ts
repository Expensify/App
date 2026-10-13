import {isValidSSNFullNine} from '@libs/ValidationUtils';

const VISIBLE_CHARACTERS = 4;

/** All but the last four characters hidden, as in •••-••-6789, so the user can tell which number they entered. A short value shows at most half of itself. */
function maskSensitiveValue(value: string): string {
    const visibleCharacters = Math.min(VISIBLE_CHARACTERS, Math.floor(value.length / 2));
    const masked = '•'.repeat(value.length - visibleCharacters) + value.slice(value.length - visibleCharacters);
    return isValidSSNFullNine(value) ? `${masked.slice(0, 3)}-${masked.slice(3, 5)}-${masked.slice(5)}` : masked;
}

export default maskSensitiveValue;
