import PropTypes from 'prop-types';

const expensiTextInputPropTypes = {
    /** Input label */
    label: PropTypes.string,

    /** Input value */
    value: PropTypes.string.isRequired,

    /** Input value placeholder */
    placeholder: PropTypes.string,

    /** Callback that is called when the text input is focused. */
    onFocusExtra: PropTypes.func,

    /** Callback that is called when the text input is blurred. */
    onBlurExtra: PropTypes.func,

    /** Input with error  */
    error: PropTypes.bool,

    /** Styles for the outermost container for this component. */
    containerStyles: PropTypes.arrayOf(PropTypes.object),

    /** Input width */
    fullWidth: PropTypes.bool,
};

export default expensiTextInputPropTypes;
