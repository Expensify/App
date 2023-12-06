import PropTypes from 'prop-types';

const baseProps = {
    /** The current input value */
    value: PropTypes.string.isRequired,

    /** Callback to update the current input value */
    setValue: PropTypes.func.isRequired,

    /** The current selection value */
    selection: PropTypes.shape({
        start: PropTypes.number.isRequired,
        end: PropTypes.number.isRequired,
    }).isRequired,

    /** Callback to update the current selection */
    setSelection: PropTypes.func.isRequired,

    /** Whether the composer is expanded */
    isComposerFullSize: PropTypes.bool.isRequired,

    /** Callback to update the comment draft */
    updateComment: PropTypes.func.isRequired,

    /** Meaures the parent container's position and dimensions. */
    measureParentContainer: PropTypes.func.isRequired,

    /** Report composer focus state */
    isComposerFocused: PropTypes.bool,
};

const implementationBaseProps = {
    /** Whether to use the small or the big suggestion picker */
    isAutoSuggestionPickerLarge: PropTypes.bool.isRequired,

    ...baseProps,
};

export {baseProps, implementationBaseProps};
