import CONST from '@src/CONST';
import type {Country} from '@src/CONST';

function isCountryCode(code: string): code is Country {
    return code in CONST.ALL_COUNTRIES;
}

export default isCountryCode;
