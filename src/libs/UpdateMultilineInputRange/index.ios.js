/**
 * Place the cursor at the end of the value (if there is a value in the input).
 *
 * When a multiline input contains a text value that goes beyond the scroll height, the cursor will be placed
 * at the end of the text value, and automatically scroll the input field to this position after the field gains
 * focus. This provides a better user experience in cases where the text in the field has to be edited. The auto-
 * scroll behaviour works on all platforms except iOS native.
 * See https://github.com/Expensify/App/issues/20836 for more details.
 *
 * @param {Object} input the input element
 * @param {boolean} shouldAutoFocus
 */
export default function updateMultilineInputRange(input, shouldAutoFocus = true) {
    if (!input) {
        return;
    }

    /*
     * Adding this iOS specific patch because of the scroll issue in native iOS
     * Issue: does not scroll multiline input when text exceeds the maximum number of lines
     * For more details: https://github.com/Expensify/App/pull/27702#issuecomment-1728651132
     */
    if (shouldAutoFocus) {
        input.focus();
    }
}
