import PropTypes from 'prop-types';
import ReportActionPropTypes from '../ReportActionPropTypes';

const propTypes = {
    /** The ID of the report this report action is attached to. */
    reportID: PropTypes.number.isRequired,

    /** The report action this context menu is attached to. */
    reportAction: PropTypes.shape(ReportActionPropTypes).isRequired,

    /** If true, this component will be a small, row-oriented menu that displays icons but not text.
    If false, this component will be a larger, column-oriented menu that displays icons alongside text in each row. */
    isMini: PropTypes.bool,

    /** Controls the visibility of this component. */
    isVisible: PropTypes.bool,

    /** The copy selection of text. */
    selection: PropTypes.string,

    /** Draft message - if this is set the comment is in 'edit' mode */
    draftMessage: PropTypes.string,
};

const defaultProps = {
    isMini: false,
    isVisible: false,
    selection: '',
    draftMessage: '',
};

export {propTypes, defaultProps};
