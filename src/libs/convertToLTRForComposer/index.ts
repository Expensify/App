import CONST from '@src/CONST';
import type ConvertToLTRForComposer from './types';

function hasRTLCharacters(text: string): boolean {
    // Regular expressions to match RTL character ranges.
    const rtlPattern = /[\u0591-\u07FF\uFB1D-\uFDFD\uFE70-\uFEFC]/;
    return rtlPattern.test(text);
}

// Converts a given text to ensure it starts with the LTR (Left-to-Right) marker.
const convertToLTRForComposer: ConvertToLTRForComposer = (text) => {
    // Ensure that the text starts with RTL characters if not we return the same text to avoid concatination with special
    // character at the start which leads to unexpected behaviour for Emoji/Mention suggestions.
    if (!hasRTLCharacters(text)) {
        // If text is empty string return empty string to avoid an empty draft due to special character.
        return text.replace(CONST.UNICODE.LTR, '');
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
