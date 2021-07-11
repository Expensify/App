import PropTypes from 'prop-types';

const propTypes = {
    /** The text for the button label */
    text: PropTypes.string,

    /** Small sized button */
    small: PropTypes.bool,

    /** Large sized button */
    large: PropTypes.bool,

    /** Indicates whether the button should be disabled and in the loading state */
    isLoading: PropTypes.bool,

    /** Indicates whether the button should be disabled */
    isDisabled: PropTypes.bool,

    /** A function that is called when the button is clicked on */
    onPress: PropTypes.func,

    /** Additional styles to add after local styles */
    style: PropTypes.oneOfType([
        PropTypes.arrayOf(PropTypes.object),
        PropTypes.object,
    ]),

    /** Additional text styles */
    textStyles: PropTypes.arrayOf(PropTypes.object),

    /** Whether we should use the success theme color */
    success: PropTypes.bool,

    /** Whether we should use the danger theme color */
    danger: PropTypes.bool,

    /** Optional content component to replace all inner contents of button */
    ContentComponent: PropTypes.func,

    /** Should we remove the right border radius top + bottom? */
    shouldRemoveRightBorderRadius: PropTypes.bool,

    /** Should we remove the left border radius top + bottom? */
    shouldRemoveLeftBorderRadius: PropTypes.bool,
};

const defaultProps = {
    text: '',
    isLoading: false,
    isDisabled: false,
    small: false,
    large: false,
    onPress: () => {},
    style: [],
    textStyles: [],
    success: false,
    danger: false,
    ContentComponent: undefined,
    shouldRemoveRightBorderRadius: false,
    shouldRemoveLeftBorderRadius: false,
};

export {
    propTypes,
    defaultProps,
};
