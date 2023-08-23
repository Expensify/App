import PropTypes from 'prop-types';
import _ from 'underscore';
import CONST from '../../CONST';

const checkboxListItemPropTypes = {
    /** The section list item */
    item: PropTypes.shape({
        /** Text to display */
        text: PropTypes.string.isRequired,

        /** Alternate text to display */
        alternateText: PropTypes.string,

        /** Key used internally by React */
        keyForList: PropTypes.string.isRequired,

        /** Whether this option is selected */
        isSelected: PropTypes.bool,

        /** Whether this option is disabled for selection */
        isDisabled: PropTypes.bool,

        /** User accountID */
        accountID: PropTypes.number,

        /** User login */
        login: PropTypes.string,

        /** Element to show on the right side of the item */
        rightElement: PropTypes.element,

        /** Avatar for the user */
        avatar: PropTypes.shape({
            source: PropTypes.oneOfType([PropTypes.string, PropTypes.func]).isRequired,
            name: PropTypes.string,
            type: PropTypes.string,
        }),

        /** Errors that this user may contain */
        errors: PropTypes.objectOf(PropTypes.string),

        /** The type of action that's pending  */
        pendingAction: PropTypes.oneOf(_.values(CONST.RED_BRICK_ROAD_PENDING_ACTION)),
    }).isRequired,

    /** Whether this item is focused (for arrow key controls) */
    isFocused: PropTypes.bool,

    /** Callback to fire when the item is pressed */
    onSelectRow: PropTypes.func.isRequired,

    /** Callback to fire when an error is dismissed */
    onDismissError: PropTypes.func,
};

const radioListItemPropTypes = {
    /** The section list item */
    item: PropTypes.shape({
        /** Text to display */
        text: PropTypes.string.isRequired,

        /** Alternate text to display */
        alternateText: PropTypes.string,

        /** Key used internally by React */
        keyForList: PropTypes.string.isRequired,

        /** Whether this option is selected */
        isSelected: PropTypes.bool,
    }).isRequired,

    /** Whether this item is focused (for arrow key controls) */
    isFocused: PropTypes.bool,

    /** Whether this item is disabled */
    isDisabled: PropTypes.bool,

    /** Callback to fire when the item is pressed */
    onSelectRow: PropTypes.func.isRequired,
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
            data: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.shape(checkboxListItemPropTypes.item), PropTypes.shape(radioListItemPropTypes.item)])),

            /** Whether this section items disabled for selection */
            isDisabled: PropTypes.bool,
        }),
    ).isRequired,

    /** Whether this is a multi-select list */
    canSelectMultiple: PropTypes.bool,

    /** Callback to fire when a row is pressed */
    onSelectRow: PropTypes.func.isRequired,

    /** Callback to fire when "Select All" checkbox is pressed. Only use along with `canSelectMultiple` */
    onSelectAll: PropTypes.func,

    /** Callback to fire when an error is dismissed */
    onDismissError: PropTypes.func,

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

    /** Text to display on the confirm button */
    confirmButtonText: PropTypes.string,

    /** Callback to fire when the confirm button is pressed */
    onConfirm: PropTypes.func,

    /** Whether to show the vertical scroll indicator */
    showScrollIndicator: PropTypes.bool,

    /** Whether to show the loading placeholder */
    showLoadingPlaceholder: PropTypes.bool,
};

export {propTypes, radioListItemPropTypes, checkboxListItemPropTypes};
