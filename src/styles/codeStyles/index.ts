import {CodeTextStyle, CodeWordStyle, CodeWordWrapperStyle} from './types';

// We do not need these on Web/Desktop as their implementation defer from Native devices so just noop them
const codeWordWrapper: CodeWordWrapperStyle = {};
const codeWordStyle: CodeWordStyle = {};
const codeTextStyle: CodeTextStyle = {};
export default {codeWordWrapper, codeWordStyle, codeTextStyle};
