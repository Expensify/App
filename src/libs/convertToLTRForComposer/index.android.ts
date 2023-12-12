import CONST from '@src/CONST';
import ConvertToLTRForComposer from './types';

/**
 * Android only - We need to determinate when composer is considered empty this going to be used when we don't want to convert the input composer to LTR
 */
function hasBeenComposerConsideredEmpty(text: string): boolean {
    // Regular expressions with all character that are consider as empty (spaces, unicode with spaces and unicode with at)
    const emptyExpressions = [/^\s*$/, new RegExp(`^${CONST.UNICODE.LTR}@$`), new RegExp(`${CONST.UNICODE.LTR}\\s*$`)];
    return emptyExpressions.some((exp) => exp.test(text));
}

/**
 * Android only - We should remove the LTR unicode when the input is empty to prevent: Sending an empty message, metion suggestions not works if @ or \s (at or space) is the first character; (force option: always remove the unicode, going to be used when composer is consider as empty) or placeholder not shows if unicode character is the only remaining character. */
const resetLTRWhenEmpty = (newComment: string, force?: boolean) => {
    const result = newComment.length <= 1 || force ? newComment.replaceAll(CONST.UNICODE.LTR, '') : newComment;
    return result;
};

/**
 * Android only - Do not convert RTL text to a LTR text for input box using Unicode controls.
 * Android does not properly support bidirectional text for mixed content for input box
 */
const convertToLTRForComposer: ConvertToLTRForComposer = (text, isComposerEmpty) => {
    const isConsideredAsEmpty = hasBeenComposerConsideredEmpty(text);
    const newText = resetLTRWhenEmpty(text, isConsideredAsEmpty);
    if (isConsideredAsEmpty) {
        return newText;
    }
    return isComposerEmpty ? `${CONST.UNICODE.LTR}${newText}` : newText;
};

/**
 * This is necessary to convert the input to LTR, there is a delay that causes the cursor not to go to the end of the input line when pasting text or typing fast. The delay is caused for the time that takes the input to convert from RTL to LTR and viceversa.
 */
const moveCursorToEndOfLine = (
    commentLength: number,
    setSelection: (
        value: React.SetStateAction<{
            start: number;
            end: number;
        }>,
    ) => void,
) => {
    setSelection({
        start: commentLength + 1,
        end: commentLength + 1,
    });
};

export {moveCursorToEndOfLine};

export default convertToLTRForComposer;
