import PropTypes from 'prop-types';
import reportPropTypes from '../../../pages/reportPropTypes';
import reportActionPropTypes from '../../../pages/home/report/reportActionPropTypes';
import reportMetadataPropTypes from '../../../pages/reportMetadataPropTypes';

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
    reportActions: PropTypes.shape(reportActionPropTypes),

    /** The report currently being looked at */
    report: reportPropTypes.isRequired,

    /** The report metadata */
    reportMetadata: reportMetadataPropTypes,
};

const defaultProps = {
    source: '',
    reportActions: {},
    reportMetadata: {},
    onNavigate: () => {},
    onClose: () => {},
    setDownloadButtonVisibility: () => {},
};

export {propTypes, defaultProps};
