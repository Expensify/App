import PropTypes from 'prop-types';
import SectionList from '../SectionList';
import styles from '../../styles/styles';
import optionPropTypes from '../optionPropTypes';

const propTypes = {
    /** option flexStyle for the options list container */
    listContainerStyles: PropTypes.arrayOf(PropTypes.object),

    /** Style for hovered state */
    // eslint-disable-next-line react/forbid-prop-types
    optionHoveredStyle: PropTypes.object,

    /** Extra styles for the section list container */
    contentContainerStyles: PropTypes.arrayOf(PropTypes.object),

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
        }),
    ),

    /** Index for option to focus on */
    focusedIndex: PropTypes.number,

    /** Array of already selected options */
    selectedOptions: PropTypes.arrayOf(optionPropTypes),

    /** Whether we can select multiple options or not */
    canSelectMultipleOptions: PropTypes.bool,

    /** Whether we highlight selected options */
    highlightSelectedOptions: PropTypes.bool,

    /** Whether to show headers above each section or not */
    hideSectionHeaders: PropTypes.bool,

    /** Whether to allow option focus or not */
    disableFocusOptions: PropTypes.bool,

    /** Display the text of the option in bold font style */
    boldStyle: PropTypes.bool,

    /** Callback to fire when a row is selected */
    onSelectRow: PropTypes.func,

    /** Optional header message */
    headerMessage: PropTypes.string,

    /** Passed via forwardRef so we can access the SectionList ref */
    innerRef: PropTypes.oneOfType([PropTypes.func, PropTypes.shape({current: PropTypes.instanceOf(SectionList)})]),

    /** Whether to show the title tooltip */
    showTitleTooltip: PropTypes.bool,

    /** Whether to disable the interactivity of the list's option row(s) */
    isDisabled: PropTypes.bool,

    /** Whether the options list skeleton loading view should be displayed */
    isLoading: PropTypes.bool,

    /** Callback to execute when the SectionList lays out */
    onLayout: PropTypes.func,

    /** Whether to show a line separating options in list */
    shouldHaveOptionSeparator: PropTypes.bool,

    /** Whether to disable the inner padding in rows */
    shouldDisableRowInnerPadding: PropTypes.bool,

    /** Whether to prevent default focusing when selecting a row */
    shouldPreventDefaultFocusOnSelectRow: PropTypes.bool,

    /** Whether to show the scroll bar */
    showScrollIndicator: PropTypes.bool,

    /** Whether to wrap large text up to 2 lines */
    isRowMultilineSupported: PropTypes.bool,

    /** Whether we are loading new options */
    isLoadingNewOptions: PropTypes.bool,

    /** Whether nested scroll of options is enabled, true by default */
    nestedScrollEnabled: PropTypes.bool,

    /** Whether the list should have a bounce effect on iOS */
    bounces: PropTypes.bool,
};

const defaultProps = {
    optionHoveredStyle: undefined,
    contentContainerStyles: [],
    listContainerStyles: [styles.flex1],
    sections: [],
    focusedIndex: 0,
    selectedOptions: [],
    canSelectMultipleOptions: false,
    highlightSelectedOptions: false,
    hideSectionHeaders: false,
    disableFocusOptions: false,
    boldStyle: false,
    onSelectRow: undefined,
    headerMessage: '',
    innerRef: null,
    showTitleTooltip: false,
    isDisabled: false,
    isLoading: false,
    onLayout: undefined,
    shouldHaveOptionSeparator: false,
    shouldDisableRowInnerPadding: false,
    shouldPreventDefaultFocusOnSelectRow: false,
    showScrollIndicator: false,
    isRowMultilineSupported: false,
    isLoadingNewOptions: false,
    nestedScrollEnabled: true,
    bounces: true,
};

export {propTypes, defaultProps};
