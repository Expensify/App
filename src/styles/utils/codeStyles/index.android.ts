import type {CodeTextStyles, CodeWordStyles, CodeWordWrapperStyles} from './types';

const codeWordWrapper: CodeWordWrapperStyles = {
    height: 20,
};

const codeWordStyle: CodeWordStyles = {
    height: 18,
    top: 4,
};

const codeTextStyle: CodeTextStyles = {
    lineHeight: 15,
};

const codePlainTextStyle: CodeTextStyles = {
    lineHeight: 14.5,
};

const codeWrapperOffset = 0;

export default {codeWordWrapper, codeWordStyle, codeTextStyle, codePlainTextStyle, codeWrapperOffset};
