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
    sections: PropTypes.arrayOf(PropTypes.shape({
        /** Title of the section */
        title: PropTypes.string,

        /** The initial index of this section given the total number of options in each section's data array */
        indexOffset: PropTypes.number,

        /** Array of options */
        data: PropTypes.arrayOf(optionPropTypes),

        /** Whether this section should show or not */
        shouldShow: PropTypes.bool,
    })),

    /** Index for option to focus on */
    focusedIndex: PropTypes.number,

    /** Array of already selected options */
    selectedOptions: PropTypes.arrayOf(optionPropTypes),

    /** Whether we can select multiple options or not */
    canSelectMultipleOptions: PropTypes.bool,

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
    innerRef: PropTypes.oneOfType([
        PropTypes.func,
        PropTypes.shape({current: PropTypes.instanceOf(SectionList)}),
    ]),

    /** Whether to show the title tooltip */
    showTitleTooltip: PropTypes.bool,

    /** Whether to disable the interactivity of the list's option row(s) */
    isDisabled: PropTypes.bool,

    /** Callback to execute when the SectionList lays out */
    onLayout: PropTypes.func,

    /** Whether to show a line separating options in list */
    shouldHaveOptionSeparator: PropTypes.bool,

    /** Whether to disable the inner padding in rows */
    disableRowInnerPadding: PropTypes.bool,
};

const defaultProps = {
    optionHoveredStyle: undefined,
    contentContainerStyles: [],
    listContainerStyles: [styles.flex1],
    sections: [],
    focusedIndex: 0,
    selectedOptions: [],
    canSelectMultipleOptions: false,
    hideSectionHeaders: false,
    disableFocusOptions: false,
    boldStyle: false,
    onSelectRow: () => {},
    headerMessage: '',
    innerRef: null,
    showTitleTooltip: false,
    isDisabled: false,
    onLayout: undefined,
    shouldHaveOptionSeparator: false,
    disableRowInnerPadding: false,
};

export {propTypes, defaultProps};
