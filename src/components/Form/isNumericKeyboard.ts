import CONST from '@src/CONST';

/**
 * Determines whether the given input props indicate a numeric or phone pad keyboard type.
 * Numeric/phone pad keyboards on iOS don't have a built-in return key. Setting returnKeyType
 * on these creates a visible toolbar button (e.g. "Go") that duplicates the form's submit button.
 */
function isNumericKeyboard(inputProps: Record<string, unknown>): boolean {
    return (
        inputProps.inputMode === CONST.INPUT_MODE.TEL ||
        inputProps.inputMode === CONST.INPUT_MODE.NUMERIC ||
        inputProps.inputMode === CONST.INPUT_MODE.DECIMAL ||
        inputProps.keyboardType === 'phone-pad' ||
        inputProps.keyboardType === 'number-pad' ||
        inputProps.keyboardType === 'decimal-pad'
    );
}

export default isNumericKeyboard;
