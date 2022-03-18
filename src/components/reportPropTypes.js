import PropTypes from 'prop-types';

export default PropTypes.shape({
    /** Number of actions unread */
    unreadActionCount: PropTypes.number,

    /** The largest sequenceNumber on this report */
    maxSequenceNumber: PropTypes.number,

    /** The current position of the new marker */
    newMarkerSequenceNumber: PropTypes.number,

    /** Whether there is an outstanding amount in IOU */
    hasOutstandingIOU: PropTypes.bool,
});
