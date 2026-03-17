import CONST from '@src/CONST';
import type {InputComponentBaseProps} from './types';

type NumericKeyboardProps = Pick<InputComponentBaseProps, 'inputMode' | 'keyboardType'>;

/**
 * Determines whether the given input props indicate a numeric or phone pad keyboard type.
 * Numeric/phone pad keyboards on iOS don't have a built-in return key. Setting returnKeyType
 * on these creates a visible toolbar button (e.g. "Go") that duplicates the form's submit button.
 */
function isNumericKeyboard(inputProps: NumericKeyboardProps): boolean {
    return (
        inputProps.inputMode === CONST.INPUT_MODE.TEL ||
        inputProps.inputMode === CONST.INPUT_MODE.NUMERIC ||
        inputProps.inputMode === CONST.INPUT_MODE.DECIMAL ||
        inputProps.keyboardType === CONST.KEYBOARD_TYPE.PHONE_PAD ||
        inputProps.keyboardType === CONST.KEYBOARD_TYPE.NUMBER_PAD ||
        inputProps.keyboardType === CONST.KEYBOARD_TYPE.DECIMAL_PAD
    );
}

export default isNumericKeyboard;
export type {NumericKeyboardProps};
