import isSelectorSupported from './isSelectorSupported';

/**
 * Check the input is auto filled or not
 * @param  {Object} input
 * @return {Boolean}
 */
export default function isInputAutoFilled(input) {
    if (!input || !input.matches) return false;
    if (isSelectorSupported(':autofill')) {
        return input.matches(':-webkit-autofill') || input.matches(':autofill');
    }
    return input.matches(':-webkit-autofill');
}
