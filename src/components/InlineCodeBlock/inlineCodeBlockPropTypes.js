import PropTypes from 'prop-types';

const inlineCodeBlockPropTypes = {
    TDefaultRenderer: PropTypes.func.isRequired,
    defaultRendererProps: PropTypes.object.isRequired,
    boxModelStyle: PropTypes.any.isRequired,
    textStyle: PropTypes.any.isRequired,

    /** Style for first word(Token) in the text */
    codeFirstWordStyle: PropTypes.object,

    /** Style for last word(Token) in the text */
    codeLastWordStyle: PropTypes.object,
};

export default inlineCodeBlockPropTypes;
