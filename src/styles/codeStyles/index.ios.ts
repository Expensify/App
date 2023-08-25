import {CodeTextStyle, CodeWordStyle, CodeWordWrapperStyle} from './types';

const codeWordWrapper: CodeWordWrapperStyle = {
    height: 22,
    justifyContent: 'center',
};

const codeWordStyle: CodeWordStyle = {
    height: 18,
    top: 4,
};

const codeTextStyle: CodeTextStyle = {
    lineHeight: 18,
};

export default {codeWordWrapper, codeWordStyle, codeTextStyle};
