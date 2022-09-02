import PropTypes from 'prop-types';
import _ from 'underscore';
import SectionList from '../SectionList';
import styles from '../../styles/styles';
import optionPropTypesLHN from './optionPropTypesLHN';
import CONST from '../../CONST';

const propTypes = {
    /** option Background Color */
    optionBackgroundColor: PropTypes.string,

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
        data: PropTypes.arrayOf(optionPropTypesLHN),

        /** Whether this section should show or not */
        shouldShow: PropTypes.bool,
    })),

    /** Index for option to focus on */
    focusedIndex: PropTypes.number,

    /** Array of already selected options */
    selectedOptions: PropTypes.arrayOf(optionPropTypesLHN),

    /** Whether we can select multiple options or not */
    canSelectMultipleOptions: PropTypes.bool,

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

    /** Toggle between compact and default view of the option */
    optionMode: PropTypes.oneOf(_.values(CONST.OPTION_MODE)),

    /** Whether to disable the interactivity of the list's option row(s) */
    isDisabled: PropTypes.bool,

    /** Callback to execute when the SectionList lays out */
    onLayout: PropTypes.func,
};

const defaultProps = {
    optionBackgroundColor: undefined,
    optionHoveredStyle: undefined,
    contentContainerStyles: [],
    sections: [],
    focusedIndex: 0,
    selectedOptions: [],
    canSelectMultipleOptions: false,
    disableFocusOptions: false,
    hideAdditionalOptionStates: false,
    forceTextUnreadStyle: false,
    onSelectRow: () => {},
    headerMessage: '',
    innerRef: null,
    optionMode: undefined,
    isDisabled: false,
    onLayout: undefined,
};

export {propTypes, defaultProps};
