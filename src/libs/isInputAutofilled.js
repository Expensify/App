/**
 * Check the input is auto filled or not
 * @param  {Object} input
 * @return {Boolean}
 */
function isInputAutoFilled(input) {
    if (!input.matches) return false;
    return input.matches(':-webkit-autofill') || input.matches(':autofill');
}

export default isInputAutoFilled;
