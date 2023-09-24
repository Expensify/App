import ConvertToLTR from './types';

/**
 * Android only - convert RTL text to a LTR text using Unicode controls.
 * https://www.w3.org/International/questions/qa-bidi-unicode-controls
 */
const convertToLTR: ConvertToLTR = (text) => `\u2066${text}`;

export default convertToLTR;
