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
// eslint-disable-next-line no-unused-vars
export default function updateMultilineInputRange(input, shouldAutoFocus = true) {
    if (!input) {
        return;
    }

    if (input.value && input.setSelectionRange) {
        const length = input.value.length;
        input.setSelectionRange(length, length);
        // eslint-disable-next-line no-param-reassign
        input.scrollTop = input.scrollHeight;
    }
}
