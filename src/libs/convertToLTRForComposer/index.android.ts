import CONST from '@src/CONST';
import ConvertToLTRForComposer from './types';

/**
 * Android only - Do not convert RTL text to a LTR text for input box using Unicode controls.
 * Android does not properly support bidirectional text for mixed content for input box
 */
const convertToLTRForComposer: ConvertToLTRForComposer = (text, isComposerEmpty) => (isComposerEmpty ? `${CONST.UNICODE.LTR}${text}` : text);
export default convertToLTRForComposer;
