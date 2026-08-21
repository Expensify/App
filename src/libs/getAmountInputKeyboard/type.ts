import type CONST from '@src/CONST';

import type {ValueOf} from 'type-fest';

type GetAmountInputKeyboard = (shouldAllowNegative?: boolean) => {
    keyboardType: ValueOf<typeof CONST.KEYBOARD_TYPE> | undefined;
    inputMode: ValueOf<typeof CONST.INPUT_MODE> | undefined;
};

export default GetAmountInputKeyboard;
