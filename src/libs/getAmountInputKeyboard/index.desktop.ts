import CONST from '@src/CONST';
import type GetAmountInputKeyboard from './type';

const getAmountInputKeyboard: GetAmountInputKeyboard = () => {
    return {
        keyboardType: CONST.KEYBOARD_TYPE.DECIMAL_PAD,
        inputMode: CONST.INPUT_MODE.DECIMAL,
    };
};

export default getAmountInputKeyboard;
