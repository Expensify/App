import PropTypes from 'prop-types';
import _ from 'underscore';
import SectionList from '../SectionList';
import styles from '../../styles/styles';
import optionPropTypes from '../optionPropTypes';
import CONST from '../../CONST';

const propTypes = {
    /** option Background Color */
    optionBackgroundColor: PropTypes.string,

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

    /** A flag to indicate whether to show additional optional states, such as pin and draft icons */
    hideAdditionalOptionStates: PropTypes.bool,

    /** Force the text style to be the unread style on all rows */
    forceTextUnreadStyle: PropTypes.bool,

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

    /** Toggle between compact and default view of the option */
    optionMode: PropTypes.oneOf(_.values(CONST.OPTION_MODE)),

    /** Whether to disable the interactivity of the list's option row(s) */
    isDisabled: PropTypes.bool,

    /** Callback to execute when the SectionList lays out */
    onLayout: PropTypes.func,

    /** Whether to show a line separating options in list */
    shouldHaveOptionSeparator: PropTypes.bool,
};

const defaultProps = {
    optionBackgroundColor: undefined,
    optionHoveredStyle: undefined,
    contentContainerStyles: [],
    listContainerStyles: [styles.flex1],
    sections: [],
    focusedIndex: 0,
    selectedOptions: [],
    canSelectMultipleOptions: false,
    hideSectionHeaders: false,
    disableFocusOptions: false,
    hideAdditionalOptionStates: false,
    forceTextUnreadStyle: false,
    onSelectRow: () => {},
    headerMessage: '',
    innerRef: null,
    showTitleTooltip: false,
    optionMode: undefined,
    isDisabled: false,
    onLayout: undefined,
    shouldHaveOptionSeparator: false,
};

export {propTypes, defaultProps};
