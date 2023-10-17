import CONST from '../../CONST';
import ConvertToLTR from './types';

const convertToLTR: ConvertToLTR = (text) => {
    // Check if the text already starts with the LTR marker (if so, return as is).
    if (text.startsWith(CONST.UNICODE.LTR)) {
        return text;
    }

    // Add the LTR marker to the beginning of the text.
    return `${CONST.UNICODE.LTR}${text}`;
};
export default convertToLTR;
