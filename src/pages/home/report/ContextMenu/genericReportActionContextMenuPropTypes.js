import PropTypes from 'prop-types';

const propTypes = {
    /** The ID of the report this report action is attached to. */
    reportID: PropTypes.string.isRequired,

    /** The ID of the report action this context menu is attached to. */
    reportActionID: PropTypes.string.isRequired,

    /** The ID of the original report from which the given reportAction is first created. */
    originalReportID: PropTypes.string.isRequired,

    /** If true, this component will be a small, row-oriented menu that displays icons but not text.
    If false, this component will be a larger, column-oriented menu that displays icons alongside text in each row. */
    isMini: PropTypes.bool,

    /** Controls the visibility of this component. */
    isVisible: PropTypes.bool,

    /** The copy selection. */
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
