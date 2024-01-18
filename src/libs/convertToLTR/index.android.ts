import CONST from '@src/CONST';
import type ConvertToLTR from './types';

/**
 * Android only - convert RTL text to a LTR text using Unicode controls.
 * https://www.w3.org/International/questions/qa-bidi-unicode-controls
 */
const convertToLTR: ConvertToLTR = (text) => `${CONST.UNICODE.LTR}${text}`;

export default convertToLTR;
