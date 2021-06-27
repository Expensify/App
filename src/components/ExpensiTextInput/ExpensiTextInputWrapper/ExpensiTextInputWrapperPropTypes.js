import PropTypes from 'prop-types';

const expensiTextInputWrapperPropTypes = {
    /** Input label */
    children: PropTypes.node.isRequired,

    /** Has Label */
    hasLabel: PropTypes.bool.isRequired,

    /** On press to wrapper */
    onPress: PropTypes.func.isRequired,

    /** Is input in focus? */
    isFocused: PropTypes.bool.isRequired,

    /** Has error? */
    error: PropTypes.bool.isRequired,

    /** Styles for the outermost container for this component. */
    containerStyles: PropTypes.arrayOf(PropTypes.object),
};

export default expensiTextInputWrapperPropTypes;
