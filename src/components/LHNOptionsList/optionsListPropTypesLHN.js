import PropTypes from 'prop-types';
import _ from 'underscore';
import SectionList from '../SectionList';
import optionPropTypesLHN from './optionPropTypesLHN';
import CONST from '../../CONST';

const propTypes = {
    /** Extra styles for the section list container */
    contentContainerStyles: PropTypes.arrayOf(PropTypes.object).isRequired,

    /** Sections for the section list */
    data: PropTypes.arrayOf(optionPropTypesLHN).isRequired,

    /** Index for option to focus on */
    focusedIndex: PropTypes.number.isRequired,

    /** Whether to allow option focus or not */
    disableFocusOptions: PropTypes.bool.isRequired,

    /** Callback to fire when a row is selected */
    onSelectRow: PropTypes.func.isRequired,

    /** Passed via forwardRef so we can access the SectionList ref */
    innerRef: PropTypes.oneOfType([
        PropTypes.func,
        PropTypes.shape({current: PropTypes.instanceOf(SectionList)}),
    ]),

    /** Toggle between compact and default view of the option */
    optionMode: PropTypes.oneOf(_.values(CONST.OPTION_MODE)).isRequired,

    /** Callback to execute when the SectionList lays out */
    onLayout: PropTypes.func.isRequired,
};

const defaultProps = {
    innerRef: null,
};

// eslint-disable-next-line import/prefer-default-export
export {propTypes, defaultProps};
