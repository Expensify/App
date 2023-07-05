import PropTypes from 'prop-types';
import CONST from '../../CONST';

const radioListItemPropTypes = {
    /** Text to display */
    text: PropTypes.string,

    /** Alternate text to display */
    alternateText: PropTypes.string,

    /** Key used internally by React */
    keyForList: PropTypes.string,

    /** Whether this option is selected */
    isSelected: PropTypes.bool,
};

const propTypes = {
    /** Sections for the section list */
    sections: PropTypes.arrayOf(
        PropTypes.shape({
            /** Title of the section */
            title: PropTypes.string,

            /** The initial index of this section given the total number of options in each section's data array */
            indexOffset: PropTypes.number,

            /** Array of options */
            data: PropTypes.arrayOf(PropTypes.shape(radioListItemPropTypes)),

            /** Whether this section items disabled for selection */
            isDisabled: PropTypes.bool,
        }),
    ).isRequired,

    /** Callback to fire when a row is tapped */
    onSelectRow: PropTypes.func,

    /** Label for the text input */
    textInputLabel: PropTypes.string,

    /** Placeholder for the text input */
    textInputPlaceholder: PropTypes.string,

    /** Value for the text input */
    textInputValue: PropTypes.string,

    /** Max length for the text input */
    textInputMaxLength: PropTypes.number,

    /** Callback to fire when the text input changes */
    onChangeText: PropTypes.func,

    /** Keyboard type for the text input */
    keyboardType: PropTypes.string,

    /** Item `keyForList` to focus initially */
    initiallyFocusedOptionKey: PropTypes.string,

    /** Whether to delay focus on the text input when mounting. Used for a smoother animation on Android */
    shouldDelayFocus: PropTypes.bool,

    /** Callback to fire when the list is scrolled */
    onScroll: PropTypes.func,

    /** Callback to fire when the list is scrolled and the user begins dragging */
    onScrollBeginDrag: PropTypes.func,

    /** Message to display at the top of the list */
    headerMessage: PropTypes.string,
};

const defaultProps = {
    onSelectRow: () => {},
    textInputLabel: '',
    textInputPlaceholder: '',
    textInputValue: '',
    textInputMaxLength: undefined,
    keyboardType: CONST.KEYBOARD_TYPE.DEFAULT,
    onChangeText: () => {},
    initiallyFocusedOptionKey: '',
    shouldDelayFocus: false,
    onScroll: () => {},
    onScrollBeginDrag: () => {},
    headerMessage: '',
};

export {propTypes, radioListItemPropTypes, defaultProps};
