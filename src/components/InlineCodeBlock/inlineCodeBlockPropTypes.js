import PropTypes from 'prop-types';

const inlineCodeBlockPropTypes = {
    TDefaultRenderer: PropTypes.func.isRequired,
    defaultRendererProps: PropTypes.object.isRequired,
    boxModelStyle: PropTypes.any.isRequired,
    textStyle: PropTypes.any.isRequired,
};

export default inlineCodeBlockPropTypes;
