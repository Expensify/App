import PropTypes from 'prop-types';

const propTypes = {
    /** Input label */
    label: PropTypes.string,

    /** Text to show if there is an error */
    errorText: PropTypes.string,

    /** Input value */
    value: PropTypes.string.isRequired,

    /** Input value placeholder */
    placeholder: PropTypes.string,

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
};

const defaultProps = {
    label: '',
    errorText: '',
    placeholder: '',
    error: false,
    containerStyles: [],
    translateX: -22,
    inputStyle: [],
    ignoreLabelTranslateX: false,
};

export {propTypes, defaultProps};
