import PropTypes from 'prop-types';
import optionPropTypes from '../optionPropTypes';
import styles from '../../styles/styles';

const propTypes = {
    /** Callback to fire when a row is tapped */
    onSelectRow: PropTypes.func,

    /** Sections for the section list */
    sections: PropTypes.arrayOf(PropTypes.shape({
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
    })).isRequired,

    /** Value in the search input field */
    value: PropTypes.string.isRequired,

    /** Callback fired when text changes */
    onChangeText: PropTypes.func.isRequired,

    /** Label to display for the text input */
    textInputLabel: PropTypes.string,

    /** Optional placeholder text for the selector */
    placeholderText: PropTypes.string,

    /** Options that have already been selected */
    selectedOptions: PropTypes.arrayOf(optionPropTypes),

    /** Optional header message */
    headerMessage: PropTypes.string,

    /** Whether we can select multiple options */
    canSelectMultipleOptions: PropTypes.bool,

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

    /** Whether to focus the textinput after an option is selected */
    shouldFocusOnSelectRow: PropTypes.bool,

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
};

const defaultProps = {
    onSelectRow: () => {},
    textInputLabel: '',
    placeholderText: '',
    selectedOptions: [],
    headerMessage: '',
    canSelectMultipleOptions: false,
    hideSectionHeaders: false,
    boldStyle: false,
    showTitleTooltip: false,
    shouldFocusOnSelectRow: false,
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
};

export {propTypes, defaultProps};
