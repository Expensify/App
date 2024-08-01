import type {TextInput} from 'react-native';
import isSelectorSupported from './isSelectorSupported';

/**
 * Check the input is auto filled or not
 */
export default function isInputAutoFilled(input: (TextInput | HTMLElement) | null): boolean {
    if ((!!input && !('matches' in input)) || !input?.matches) {
        return false;
    }
    if (isSelectorSupported(':autofill')) {
        return input.matches(':-webkit-autofill') || input.matches(':autofill');
    }
    return input.matches(':-webkit-autofill');
}
