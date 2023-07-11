import PropTypes from 'prop-types';

export default PropTypes.shape({
    /** The report ID of the IOU */
    reportID: PropTypes.string,

    /** The report ID of the chat associated with the IOU */
    chatReportID: PropTypes.string,

    /** The total amount in cents */
    total: PropTypes.number,

    /** The owner of the IOUReport */
    ownerAccountID: PropTypes.number,

    /** The currency of the IOUReport */
    currency: PropTypes.string,
});
