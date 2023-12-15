import CONST from '@src/CONST';
import ConvertToLTRForComposer from './types';

/**
 * Android only - The composer can be converted to LTR if its content is the LTR character followed by an @ or space
 * because to mention sugggestion works the @ character must not have any character at the beginning e.g.: \u2066@ doesn't work
 * also to avoid sending empty messages the unicode character with space could enable the send button.
 */
function canComposerBeConvertedToLTR(text: string): boolean {
    // This regex handles the case when a user only types spaces into the composer.
    const containOnlySpaces = /^\s*$/;
    // This regex handles the case where someone has RTL enabled and they began typing an @mention for someone.
    const startsWithLTRAndAt = new RegExp(`^${CONST.UNICODE.LTR}@$`);
    // This regex handles the case where the composer can contain multiple lines of whitespace
    const startsWithLTRAndSpace = new RegExp(`${CONST.UNICODE.LTR}\\s*$`);
    const emptyExpressions = [containOnlySpaces, startsWithLTRAndAt, startsWithLTRAndSpace];
    return emptyExpressions.some((exp) => exp.test(text));
}

/**
 * Android only - We should remove the LTR unicode when the input is empty to prevent:
 *  Sending an empty message;
 *  Mention suggestions not works if @ or \s (at or space) is the first character;
 *  Placeholder is not displayed if the unicode character is the only character remaining;
 *
 * @param {String} newComment - the comment written by the user
 * @param {Boolean} force - always remove the LTR unicode, going to be used when composer is consider as empty
 * @return {String}
 */

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
