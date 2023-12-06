/**
 * Android only - convert RTL text to a LTR text using Unicode controls.
 *
 * In React Native, when working with bidirectional text (RTL - Right-to-Left or LTR - Left-to-Right), you may encounter issues related to text rendering, especially on Android devices. These issues arise because Android's default behavior for text direction might not always align with the desired directionality of your app.
 */
import CONST from '@src/CONST';
import ConvertToLTR from './types';

const convertToLTR: ConvertToLTR = (text) => `${CONST.UNICODE.LTR}${text}`;

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

export default convertToLTR;
