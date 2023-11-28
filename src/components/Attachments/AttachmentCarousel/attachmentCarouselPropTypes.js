import PropTypes from 'prop-types';
import transactionPropTypes from '@components/transactionPropTypes';
import reportActionPropTypes from '@pages/home/report/reportActionPropTypes';
import reportPropTypes from '@pages/reportPropTypes';

const propTypes = {
    /** source is used to determine the starting index in the array of attachments */
    source: PropTypes.string,

    /** Callback to update the parent modal's state with a source and name from the attachments array */
    onNavigate: PropTypes.func,

    /** Callback to close carousel when user swipes down (on native) */
    onClose: PropTypes.func,

    /** Function to change the download button Visibility */
    setDownloadButtonVisibility: PropTypes.func,

    /** Object of report actions for this report */
    reportActions: PropTypes.objectOf(PropTypes.shape(reportActionPropTypes)),

    /** The report currently being looked at */
    report: reportPropTypes.isRequired,

    /** The parent of `report` */
    parentReport: reportPropTypes,

    /** The report actions of the parent report */
    parentReportActions: PropTypes.objectOf(PropTypes.shape(reportActionPropTypes)),

    /** The transaction attached to the parent report action */
    transaction: transactionPropTypes,
};

const defaultProps = {
    source: '',
    reportActions: {},
    parentReport: {},
    parentReportActions: {},
    transaction: {},
    onNavigate: () => {},
    onClose: () => {},
    setDownloadButtonVisibility: () => {},
};

export {propTypes, defaultProps};
