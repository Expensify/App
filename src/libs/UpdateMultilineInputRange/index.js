import * as Browser from '@libs/Browser';

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

    if (input.value && input.setSelectionRange) {
        const length = input.value.length;

        // On mobile safari, setting a selection will focus the input even when the auto focus is false.
        // So, don't set the selection if the browser is mobile safari and auto focus is false.
        const shouldSetSelection = !(Browser.isMobileSafari() && !shouldAutoFocus);
        if (shouldSetSelection) {
            input.setSelectionRange(length, length);
        }
        // eslint-disable-next-line no-param-reassign
        input.scrollTop = input.scrollHeight;
    }
}
