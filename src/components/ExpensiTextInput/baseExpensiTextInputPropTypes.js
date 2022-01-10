import PropTypes from 'prop-types';

const propTypes = {
    /** Input label */
    label: PropTypes.string,

    /** Name attribute for the input */
    name: PropTypes.string,

    /** Input value */
    value: PropTypes.string,

    /** Default value - used for non controlled inputs */
    defaultValue: PropTypes.string,

    /** Input value placeholder */
    placeholder: PropTypes.string,

    /** Error text to display */
    errorText: PropTypes.string,

    /** Should the input be styled for errors  */
    hasError: PropTypes.bool,

    /** Customize the ExpensiTextInput container */
    containerStyles: PropTypes.arrayOf(PropTypes.object),

    /** input style */
    inputStyle: PropTypes.arrayOf(PropTypes.object),

    forceActiveLabel: PropTypes.bool,

    /** Should the input auto focus? */
    autoFocus: PropTypes.bool,
};

const defaultProps = {
    label: '',
    name: '',
    errorText: '',
    placeholder: '',
    containerStyles: [],
    inputStyle: [],
    autoFocus: false,

    /**
     * To be able to function as either controlled or uncontrolled component we should not
     * assign a default prop value for `value` or `defaultValue` props
     */
    value: undefined,
    defaultValue: undefined,
    forceActiveLabel: false,
};

export {propTypes, defaultProps};
