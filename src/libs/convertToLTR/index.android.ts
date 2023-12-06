import CONST from '@src/CONST';
import ConvertToLTR from './types';

/**
 * Android only - convert RTL text to a LTR text using Unicode controls.
 * https://www.w3.org/International/questions/qa-bidi-unicode-controls
 */
const convertToLTR: ConvertToLTR = (text) => `${CONST.UNICODE.LTR}${text}`;

/** This is necessary to convert the input to LTR, there is a delay that causes the cursor not to go to the end of the input line when pasting text or typing fast. */
const moveCursorToEndOfLine = (commentLength: number, setSelection:(value: React.SetStateAction<{
    start: number;
    end: number;
}>)=>void) => {
    setSelection({
        start: commentLength + 1,
        end: commentLength + 1,
    });
}

/** We should remove the LTR unicode when the input is empty to prevent: Sending an empty message, bad function of metion suggestions (force option: always remove the unicode), or placeholder issues */
const removeUnicodeLTRWhenEmpty = (newComment:string, newCommentConverted:string, force?:boolean) => {
    
    const removeRegEx = new RegExp(`${CONST.UNICODE.LTR}`,'g')

    const result = newComment.length <= 1 || force ? newCommentConverted.replace(removeRegEx, '') : newCommentConverted;
    return result;
}

export {moveCursorToEndOfLine, removeUnicodeLTRWhenEmpty};

export default convertToLTR;
