import PropTypes from 'prop-types';
import optionPropTypes from '../optionPropTypes';
import styles from '../../styles/styles';
import CONST from '../../CONST';

const propTypes = {
    /** Callback to fire when a row is tapped */
    onSelectRow: PropTypes.func,

    /** Sections for the section list */
    sections: PropTypes.arrayOf(
        PropTypes.shape({
            /** Title of the section */
            title: PropTypes.string,

            /** The initial index of this section given the total number of options in each section's data array */
            indexOffset: PropTypes.number,

            /** Array of options */
            data: PropTypes.arrayOf(optionPropTypes),

            /** Whether this section should show or not */
            shouldShow: PropTypes.bool,

            /** Whether this section items disabled for selection */
            isDisabled: PropTypes.bool,
        }),
    ).isRequired,

    /** Value in the search input field */
    value: PropTypes.string.isRequired,

    /** Callback fired when text changes */
    onChangeText: PropTypes.func,

    /** Limits the maximum number of characters that can be entered in input field */
    maxLength: PropTypes.number,

    /** Label to display for the text input */
    textInputLabel: PropTypes.string,

    /** Optional keyboard type for the input */
    keyboardType: PropTypes.string,

    /** Optional placeholder text for the selector */
    placeholderText: PropTypes.string,

    /** Options that have already been selected */
    selectedOptions: PropTypes.arrayOf(optionPropTypes),

    /** Optional header message */
    headerMessage: PropTypes.string,

    /** Whether we can select multiple options */
    canSelectMultipleOptions: PropTypes.bool,

    /** Whether to show a button pill instead of a standard tickbox */
    shouldShowMultipleOptionSelectorAsButton: PropTypes.bool,

    /** Text for button pill */
    multipleOptionSelectorButtonText: PropTypes.string,

    /** Callback to fire when the multiple selector (tickbox or button) is clicked */
    onAddToSelection: PropTypes.func,

    /** Whether we highlight selected options */
    highlightSelectedOptions: PropTypes.bool,

    /** Whether any section headers should be visible */
    hideSectionHeaders: PropTypes.bool,

    /** Whether to allow arrow key actions on the list */
    disableArrowKeysActions: PropTypes.bool,

    /** Whether to disable interactivity of option rows */
    isDisabled: PropTypes.bool,

    /** Display the text of the option in bold font style */
    boldStyle: PropTypes.bool,

    /** Whether to show the title tooltip */
    showTitleTooltip: PropTypes.bool,

    /** Whether to prevent default focusing of options and focus the textinput when selecting an option */
    shouldPreventDefaultFocusOnSelectRow: PropTypes.bool,

    /** Whether to autofocus the search input on mount */
    autoFocus: PropTypes.bool,

    /** Should a button be shown if a selection is made (only relevant if canSelectMultipleOptions is true) */
    shouldShowConfirmButton: PropTypes.bool,

    /** Text to show in the confirm button (only visible if multiple options are selected) */
    confirmButtonText: PropTypes.string,

    /** Function to execute if the confirm button is pressed */
    onConfirmSelection: PropTypes.func,

    /** If true, the text input will be below the options in the selector, not above. */
    shouldTextInputAppearBelowOptions: PropTypes.bool,

    /** If false, the text input will not be shown at all. Defaults to true */
    shouldShowTextInput: PropTypes.bool,

    /** Custom content to display in the footer instead of the default button. */
    footerContent: PropTypes.oneOfType([PropTypes.func, PropTypes.node]),

    /** Hover style for options in the OptionsList */
    optionHoveredStyle: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.object), PropTypes.object]),

    /** Whether to show options list */
    shouldShowOptions: PropTypes.bool,

    /** Whether to show a line separating options in list */
    shouldHaveOptionSeparator: PropTypes.bool,

    /** Key of the option that we should focus on when first opening the options list */
    initiallyFocusedOptionKey: PropTypes.string,

    /** Whether to use default padding and flex styles for children */
    shouldUseStyleForChildren: PropTypes.bool,

    /** Whether to wrap large text up to 2 lines */
    isRowMultilineSupported: PropTypes.bool,

    /** Initial focused index value */
    initialFocusedIndex: PropTypes.number,

    /** Whether the text input should intercept swipes or not */
    shouldTextInputInterceptSwipe: PropTypes.bool,

    /** Whether we should allow the view wrapping the nested children to be scrollable */
    shouldAllowScrollingChildren: PropTypes.bool,

    /** Whether nested scroll of options is enabled, true by default */
    nestedScrollEnabled: PropTypes.bool,
};

const defaultProps = {
    onSelectRow: undefined,
    textInputLabel: '',
    placeholderText: '',
    keyboardType: 'default',
    selectedOptions: [],
    headerMessage: '',
    canSelectMultipleOptions: false,
    shouldShowMultipleOptionSelectorAsButton: false,
    multipleOptionSelectorButtonText: '',
    onAddToSelection: () => {},
    highlightSelectedOptions: false,
    hideSectionHeaders: false,
    boldStyle: false,
    showTitleTooltip: false,
    shouldPreventDefaultFocusOnSelectRow: false,
    autoFocus: true,
    shouldShowConfirmButton: false,
    confirmButtonText: undefined,
    onConfirmSelection: () => {},
    shouldTextInputAppearBelowOptions: false,
    footerContent: undefined,
    optionHoveredStyle: styles.hoveredComponentBG,
    shouldShowOptions: true,
    disableArrowKeysActions: false,
    isDisabled: false,
    shouldHaveOptionSeparator: false,
    initiallyFocusedOptionKey: undefined,
    maxLength: CONST.SEARCH_MAX_LENGTH,
    shouldShowTextInput: true,
    onChangeText: () => {},
    shouldUseStyleForChildren: true,
    isRowMultilineSupported: false,
    initialFocusedIndex: undefined,
    shouldTextInputInterceptSwipe: false,
    shouldAllowScrollingChildren: false,
    nestedScrollEnabled: true,
};

export {propTypes, defaultProps};
