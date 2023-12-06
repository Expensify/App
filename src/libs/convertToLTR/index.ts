import ConvertToLTR from './types';

const convertToLTR: ConvertToLTR = (text) => text;

const moveCursorToEndOfLine = (
    commentLength: number,
    setSelection: (
        value: React.SetStateAction<{
            start: number;
            end: number;
        }>,
    ) => void,
) => setSelection;

const removeUnicodeLTRWhenEmpty = (newComment: string) => newComment;

export {moveCursorToEndOfLine, removeUnicodeLTRWhenEmpty};

export default convertToLTR;
