import PropTypes from 'prop-types';

export default PropTypes.shape({
    /** Name of the report */
    reportName: PropTypes.string,

    /** List of primarylogins of participants of the report */
    participants: PropTypes.arrayOf(PropTypes.string),

    /** List of icons for report participants */
    icons: PropTypes.arrayOf(PropTypes.string),

    /** ID of the report */
    reportID: PropTypes.string.isRequired,

    /** The largest sequenceNumber on this report */
    maxSequenceNumber: PropTypes.number,

    /** Whether there is an outstanding amount in IOU */
    hasOutstandingIOU: PropTypes.bool,

    /** Are we loading more report actions? */
    isLoadingMoreReportActions: PropTypes.bool,

    /** The current user's notification preference for this report */
    notificationPreference: PropTypes.oneOf(['mute', 'daily', 'always']),

    /** Linked policy's ID */
    policyID: PropTypes.string,

    /** Flag to check if the report actions data are loading */
    isLoadingReportActions: PropTypes.bool,

    /** Whether the user is not an admin of policyExpenseChat chat */
    isOwnPolicyExpenseChat: PropTypes.bool,

    chatType: PropTypes.string,
    ownerEmail: PropTypes.string,
    isPinned: PropTypes.bool,
    lastVisitedTimestamp: PropTypes.number,
    lastReadSequenceNumber: PropTypes.number,
    lastMessageTimestamp: PropTypes.number,
    lastMessageText: PropTypes.string,
    lastActorEmail: PropTypes.string,
    stateNum: PropTypes.number,
    statusNum: PropTypes.number,
    oldPolicyName: PropTypes.string,
});
