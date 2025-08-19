import type {ValueOf} from 'type-fest';
import type CONST from '@src/CONST';

type GetAmountInputKeyboard = (shouldAllowNegative?: boolean) => {
    keyboardType: ValueOf<typeof CONST.KEYBOARD_TYPE> | undefined;
    inputMode: ValueOf<typeof CONST.INPUT_MODE> | undefined;
};

export default GetAmountInputKeyboard;
