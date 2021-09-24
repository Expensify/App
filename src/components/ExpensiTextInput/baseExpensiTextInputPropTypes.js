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
    defaultValue: undefined,
    forceActiveLabel: false,
};

export {propTypes, defaultProps};
