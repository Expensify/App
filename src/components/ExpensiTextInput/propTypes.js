import PropTypes from 'prop-types';

const propTypes = {
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
    placeholder: '',
    error: false,
    onFocusExtra: null,
    onBlurExtra: null,
    containerStyles: [],
    translateX: -22,
    inputStyle: [],
    ignoreLabelTranslateX: false,
};

export {propTypes, defaultProps};
