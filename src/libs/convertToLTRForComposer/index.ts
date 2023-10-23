import CONST from '../../CONST';
import ConvertToLTRForComposer from './types';

function hasLTRorRTLCharacters(text: string): boolean {
    // Regular expressions to match LTR and RTL character ranges.
    // eslint-disable-next-line no-control-regex
    const ltrPattern = /[\u0001-\u05FF\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]/;
    const rtlPattern = /[\u0591-\u07FF\uFB1D-\uFDFD\uFE70-\uFEFC]/;

    return ltrPattern.test(text) || rtlPattern.test(text);
}

// Converts a given text to ensure it starts with the LTR (Left-to-Right) marker.
const convertToLTRForComposer: ConvertToLTRForComposer = (text) => {
    // Ensure the text contains LTR or RTL characters to avoid an unwanted special character at the beginning, even after a backspace deletion.
    if (!hasLTRorRTLCharacters(text)) {
        return '';
    }

    // Check if the text contains only spaces. If it does, we do not concatenate it with CONST.UNICODE.LTR,
    // as doing so would alter the normal behavior of the input box.
    if (/^\s*$/.test(text)) {
        return text;
    }

    // Check if the text already starts with the LTR marker (if so, return as is).
    if (text.startsWith(CONST.UNICODE.LTR)) {
        return text;
    }

    // Add the LTR marker to the beginning of the text.
    return `${CONST.UNICODE.LTR}${text}`;
};
export default convertToLTRForComposer;
