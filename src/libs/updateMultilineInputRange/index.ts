import * as Browser from '@libs/Browser';
import UpdateMultilineInputRange from './types';

/**
 * Place the cursor at the end of the value (if there is a value in the input).
 *
 * When a multiline input contains a text value that goes beyond the scroll height, the cursor will be placed
 * at the end of the text value, and automatically scroll the input field to this position after the field gains
 * focus. This provides a better user experience in cases where the text in the field has to be edited. The auto-
 * scroll behaviour works on all platforms except iOS native.
 * See https://github.com/Expensify/App/issues/20836 for more details.
 */
const updateMultilineInputRange: UpdateMultilineInputRange = (input, shouldAutoFocus = true) => {
    if (!input) {
        return;
    }

    if ('value' in input && input.value && input.setSelectionRange) {
        const length = input.value.length;

        // For mobile Safari, updating the selection prop on an unfocused input will cause it to automatically gain focus
        // and subsequent programmatic focus shifts (e.g., modal focus trap) to show the blue frame (:focus-visible style),
        // so we need to ensure that it is only updated after focus.
        const shouldSetSelection = !(Browser.isMobileSafari() && !shouldAutoFocus);
        if (shouldSetSelection) {
            input.setSelectionRange(length, length);
        }
        // eslint-disable-next-line no-param-reassign
        input.scrollTop = input.scrollHeight;
    }
};

export default updateMultilineInputRange;
