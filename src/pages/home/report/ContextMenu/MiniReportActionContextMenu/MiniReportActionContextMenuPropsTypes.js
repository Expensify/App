import PropTypes from 'prop-types';
import {withLocalizePropTypes} from '../../../../../components/withLocalize';
import ReportActionPropTypes from '../../ReportActionPropTypes';

const propTypes = {
    /** The ID of the report this report action is attached to. */
    // eslint-disable-next-line react/no-unused-prop-types
    reportID: PropTypes.number.isRequired,

    /** The report action this context menu is attached to. */
    reportAction: PropTypes.shape(ReportActionPropTypes).isRequired,

    /** Controls the visibility of this component. */
    isVisible: PropTypes.bool,

    /** The copy selection of text. */
    selection: PropTypes.string,

    /** Draft message - if this is set the comment is in 'edit' mode */
    draftMessage: PropTypes.string,

    /** Function to show the delete Action confirmation modal */
    showDeleteConfirmModal: PropTypes.func.isRequired,

    ...withLocalizePropTypes,
};

const defaultProps = {
    isVisible: false,
    selection: '',
    draftMessage: '',
};

export {
    propTypes,
    defaultProps,
};
