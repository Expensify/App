import {CodeTextStyles, CodeWordWrapperStyles} from './types';

// We do not need these on Web/Desktop as their implementation defer from Native devices so just noop them
const codeWordWrapper: CodeWordWrapperStyles = {};
const codeTextStyle: CodeTextStyles = {};
export default {codeWordWrapper, codeTextStyle};
