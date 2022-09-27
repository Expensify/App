import _ from 'underscore';
import PropTypes from 'prop-types';
import CONST from '../CONST';

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

    /** The specific type of chat */
    chatType: PropTypes.oneOf(_.values(CONST.REPORT.CHAT_TYPE)),

    /** The email address of the report owner */
    ownerEmail: PropTypes.string,

    /** Indicates if the report is pinned to the LHN or not */
    isPinned: PropTypes.bool,

    /** The last time the report was visited */
    lastVisitedTimestamp: PropTypes.number,

    /** The sequence number of the last action read by the user */
    lastReadSequenceNumber: PropTypes.number,

    /** The time of the last message on the report */
    lastMessageTimestamp: PropTypes.number,

    /** The text of the last message on the report */
    lastMessageText: PropTypes.string,

    /** The email of the last message's actor */
    lastActorEmail: PropTypes.string,

    /** The state that the report is currently in */
    stateNum: PropTypes.oneOf(_.values(CONST.REPORT.STATE_NUM)),

    /** The status of the current report */
    statusNum: PropTypes.oneOf(_.values(CONST.REPORT.STATUS)),

    /** The policy name to use for an archived report */
    oldPolicyName: PropTypes.string,
});
