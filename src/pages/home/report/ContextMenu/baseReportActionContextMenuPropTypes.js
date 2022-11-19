import PropTypes from 'prop-types';
import reportActionPropTypes from '../reportActionPropTypes';

const propTypes = {
    /** The ID of the report this report action is attached to. */
    reportID: PropTypes.string.isRequired,

    /** The report action this context menu is attached to. */
    reportAction: PropTypes.shape(reportActionPropTypes).isRequired,

    /** If true, this component will be a small, row-oriented menu that displays icons but not text.
    If false, this component will be a larger, column-oriented menu that displays icons alongside text in each row. */
    isMini: PropTypes.bool,

    /** Controls the visibility of this component. */
    isVisible: PropTypes.bool,

    /** The copy selection. */
    selection: PropTypes.string,

    /** Draft message - if this is set the comment is in 'edit' mode */
    draftMessage: PropTypes.string,

    /** Flag to check if the chat participant is Chronos */
    isChronosReport: PropTypes.bool,

    /** Whether the provided report is an archived room */
    isArchivedRoom: PropTypes.bool,
};

const defaultProps = {
    isMini: false,
    isVisible: false,
    selection: '',
    draftMessage: '',
    isChronosReport: false,
    isArchivedRoom: false,
};

export {propTypes, defaultProps};
