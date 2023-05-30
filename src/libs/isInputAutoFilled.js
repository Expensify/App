/**
 * Check the input is auto filled or not
 * @param  {Object} input
 * @return {Boolean}
 */
export default function isInputAutoFilled(input) {
    if (!input.matches) return false;
    return input.matches(':-webkit-autofill') || input.matches(':autofill');
}
