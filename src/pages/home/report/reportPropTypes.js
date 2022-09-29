import PropTypes from 'prop-types';

export default PropTypes.shape({
    /** The largest sequenceNumber on this report */
    maxSequenceNumber: PropTypes.number,

    /** Whether there is an outstanding amount in IOU */
    hasOutstandingIOU: PropTypes.bool,

    /** Flag to check if the report actions data are loading */
    isLoadingReportActions: PropTypes.bool,

    /** ID for the report */
    reportID: PropTypes.number,
});
