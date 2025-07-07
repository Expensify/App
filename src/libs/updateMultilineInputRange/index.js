"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Place the cursor at the end of the value (if there is a value in the input).
 *
 * When a multiline input contains a text value that goes beyond the scroll height, the cursor will be placed
 * at the end of the text value, and automatically scroll the input field to this position after the field gains
 * focus. This provides a better user experience in cases where the text in the field has to be edited. The auto-
 * scroll behaviour works on all platforms except iOS native.
 * See https://github.com/Expensify/App/issues/20836 for more details.
 */
var updateMultilineInputRange = function (input, shouldAutoFocus) {
    if (shouldAutoFocus === void 0) { shouldAutoFocus = true; }
    if (!input) {
        return;
    }
    if ('value' in input && typeof input.value === 'string' && input.setSelectionRange) {
        var length_1 = input.value.length;
        if (shouldAutoFocus) {
            input.setSelectionRange(length_1, length_1);
        }
        // eslint-disable-next-line no-param-reassign
        input.scrollTop = input.scrollHeight;
    }
};
exports.default = updateMultilineInputRange;
