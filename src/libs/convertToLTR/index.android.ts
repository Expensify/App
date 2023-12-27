/**
 * Android only - convert RTL text to a LTR text using Unicode controls.
 *
 * In React Native, when working with bidirectional text (RTL - Right-to-Left or LTR - Left-to-Right), you may encounter issues related to text rendering, especially on Android devices. These issues arise because Android's default behavior for text direction might not always align with the desired directionality of your app.
 */
import CONST from '@src/CONST';
import ConvertToLTR from './types';

const convertToLTR: ConvertToLTR = (text) => `${CONST.UNICODE.LTR}${text}`;

export default convertToLTR;
