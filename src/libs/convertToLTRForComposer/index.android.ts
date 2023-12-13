import CONST from '@src/CONST';
import ConvertToLTRForComposer from './types';

/**
 * Android only - The composer can be converted to LTR if its content is the LTR character followed by an @ or space
 */
function canComposerBeConvertedToLTR(text: string): boolean {
    // this handle cases when user type only spaces
    const containOnlySpaces = /^\s*$/;
    // this handle the case where someone has RTL enabled and they began typing an @mention for someone.
    const startsWithLTRAndAt = new RegExp(`^${CONST.UNICODE.LTR}@$`);
    // this handle cases could send empty messages when composer is multiline
    const startsWithLTRAndSpace = new RegExp(`${CONST.UNICODE.LTR}\\s*$`);
    const emptyExpressions = [containOnlySpaces, startsWithLTRAndAt, startsWithLTRAndSpace];
    return emptyExpressions.some((exp) => exp.test(text));
}

/**
 * Android only - We should remove the LTR unicode when the input is empty to prevent:
 *  Sending an empty message;
 *  Mention suggestions not works if @ or \s (at or space) is the first character;
 *  Placeholder is not displayed if the unicode character is the only character remaining;
 * force: always remove the LTR unicode, going to be used when composer is consider as empty */
const resetLTRWhenEmpty = (newComment: string, force?: boolean) => {
    const result = newComment.length <= 1 || force ? newComment.replaceAll(CONST.UNICODE.LTR, '') : newComment;
    return result;
};

/**
 * Android only - Do not convert RTL text to a LTR text for input box using Unicode controls.
 * Android does not properly support bidirectional text for mixed content for input box
 */
const convertToLTRForComposer: ConvertToLTRForComposer = (text, isComposerEmpty) => {
    const shouldComposerMaintainAsLTR = canComposerBeConvertedToLTR(text);
    const newText = resetLTRWhenEmpty(text, shouldComposerMaintainAsLTR);
    if (shouldComposerMaintainAsLTR) {
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
