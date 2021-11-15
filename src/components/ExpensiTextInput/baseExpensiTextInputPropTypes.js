import PropTypes from 'prop-types';

const propTypes = {
    /** Input label */
    label: PropTypes.string,

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

    /** label translate x */
    translateX: PropTypes.number,

    /** input style */
    inputStyle: PropTypes.arrayOf(PropTypes.object),

    /** should ignore labels translate x? */
    ignoreLabelTranslateX: PropTypes.bool,

    forceActiveLabel: PropTypes.bool,

    /** Should the input auto focus? */
    autoFocus: PropTypes.bool,
};

const defaultProps = {
    label: '',
    errorText: '',
    placeholder: '',
    hasError: false,
    containerStyles: [],
    translateX: -22,
    inputStyle: [],
    ignoreLabelTranslateX: false,
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
