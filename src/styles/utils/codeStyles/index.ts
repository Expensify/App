import type {CodeTextStyles, CodeWordStyles, CodeWordWrapperStyles} from './types';

// We do not need these on Web/Desktop as their implementation defer from Native devices so just noop them
const codeWordWrapper: CodeWordWrapperStyles = {};
const codeWordStyle: CodeWordStyles = {};
const codeTextStyle: CodeTextStyles = {};
const codePlainTextStyle: CodeTextStyles = {};
const codeWrapperOffset = 0;
export default {codeWordWrapper, codeWordStyle, codeTextStyle, codePlainTextStyle, codeWrapperOffset};
