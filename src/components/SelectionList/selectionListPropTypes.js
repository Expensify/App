import PropTypes from 'prop-types';
import _ from 'underscore';
import CONST from '@src/CONST';

const commonListItemPropTypes = {
    /** Whether this item is focused (for arrow key controls) */
    isFocused: PropTypes.bool,

    /** Whether this item is disabled */
    isDisabled: PropTypes.bool,

    /** Whether this item should show Tooltip */
    showTooltip: PropTypes.bool.isRequired,

    /** Whether to use the Checkbox (multiple selection) instead of the Checkmark (single selection) */
    canSelectMultiple: PropTypes.bool,

    /** Callback to fire when the item is pressed */
    onSelectRow: PropTypes.func.isRequired,

    /** Callback to fire when an error is dismissed */
    onDismissError: PropTypes.func,
};

const userListItemPropTypes = {
    ...commonListItemPropTypes,

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

        /** Icons for the user (can be multiple if it's a Workspace) */
        icons: PropTypes.arrayOf(
            PropTypes.shape({
                source: PropTypes.oneOfType([PropTypes.string, PropTypes.func]).isRequired,
                name: PropTypes.string,
                type: PropTypes.string,
            }),
        ),

        /** Errors that this user may contain */
        errors: PropTypes.objectOf(PropTypes.string),

        /** The type of action that's pending  */
        pendingAction: PropTypes.oneOf(_.values(CONST.RED_BRICK_ROAD_PENDING_ACTION)),
    }).isRequired,
};

const radioListItemPropTypes = {
    ...commonListItemPropTypes,

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
};

const baseListItemPropTypes = {
    ...commonListItemPropTypes,
    item: PropTypes.oneOfType([PropTypes.shape(userListItemPropTypes.item), PropTypes.shape(radioListItemPropTypes.item)]),
    shouldPreventDefaultFocusOnSelectRow: PropTypes.bool,
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
            data: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.shape(userListItemPropTypes.item), PropTypes.shape(radioListItemPropTypes.item)])),

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

    /** Input mode for the text input */
    inputMode: PropTypes.string,

    /** Item `keyForList` to focus initially */
    initiallyFocusedOptionKey: PropTypes.string,

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

    /** Whether to show the default confirm button */
    showConfirmButton: PropTypes.bool,

    /** Whether to stop automatic form submission on pressing enter key or not */
    shouldStopPropagation: PropTypes.bool,

    /** Whether to prevent default focusing of options and focus the textinput when selecting an option */
    shouldPreventDefaultFocusOnSelectRow: PropTypes.bool,

    /** A ref to forward to the TextInput */
    inputRef: PropTypes.oneOfType([PropTypes.object]),

    /** Custom content to display in the header */
    headerContent: PropTypes.oneOfType([PropTypes.func, PropTypes.node]),

    /** Custom content to display in the footer */
    footerContent: PropTypes.oneOfType([PropTypes.func, PropTypes.node]),

    /** Whether to use dynamic maxToRenderPerBatch depending on the visible number of elements */
    shouldUseDynamicMaxToRenderPerBatch: PropTypes.bool,
};

export {propTypes, baseListItemPropTypes, radioListItemPropTypes, userListItemPropTypes};
