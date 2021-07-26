import PropTypes from 'prop-types';
import {withLocalizePropTypes} from '../../../../components/withLocalize';
import ReportActionPropTypes from '../ReportActionPropTypes';

const propTypes = {
    /** The ID of the report this report action is attached to. */
    // eslint-disable-next-line react/no-unused-prop-types
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

    /** Function to show the delete Action confirmation modal */
    showDeleteConfirmModal: PropTypes.func.isRequired,

    /** Function to dismiss the popover containing this menu */
    hidePopover: PropTypes.func.isRequired,

    ...withLocalizePropTypes,
};

const defaultProps = {
    isMini: false,
    isVisible: false,
    selection: '',
    draftMessage: '',
};

export {propTypes, defaultProps};
