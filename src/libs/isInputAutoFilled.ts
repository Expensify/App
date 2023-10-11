import isSelectorSupported from './isSelectorSupported';

/**
 * Check the input is auto filled or not
 */
export default function isInputAutoFilled(input: Element): boolean {
    if (!input?.matches) {
        return false;
    }
    if (isSelectorSupported(':autofill')) {
        return input.matches(':-webkit-autofill') || input.matches(':autofill');
    }
    return input.matches(':-webkit-autofill');
}
