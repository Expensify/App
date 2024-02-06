import type {CodeTextStyles, CodeWordStyles, CodeWordWrapperStyles} from './types';

const codeWordWrapper: CodeWordWrapperStyles = {
    height: 22,
    justifyContent: 'center',
};

const codeWordStyle: CodeWordStyles = {
    height: 18,
    top: 4,
};

const codeTextStyle: CodeTextStyles = {
    lineHeight: 18,
};

const codePlainTextStyle: CodeTextStyles = {
    lineHeight: 15,
};

export default {codeWordWrapper, codeWordStyle, codeTextStyle, codePlainTextStyle};
