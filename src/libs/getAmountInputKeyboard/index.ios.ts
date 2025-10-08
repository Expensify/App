import CONST from '@src/CONST';
import type GetAmountInputKeyboard from './type';

const getAmountInputKeyboard: GetAmountInputKeyboard = (shouldAllowNegative = false) => {
    return {
        keyboardType: shouldAllowNegative ? CONST.KEYBOARD_TYPE.NUMBERS_AND_PUNCTUATION : CONST.KEYBOARD_TYPE.DECIMAL_PAD,
        inputMode: shouldAllowNegative ? undefined : CONST.INPUT_MODE.DECIMAL,
    };
};

export default getAmountInputKeyboard;
