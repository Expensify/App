import PropTypes from 'prop-types';
import _ from 'underscore';
import avatarPropTypes from '@components/avatarPropTypes';
import CONST from '@src/CONST';

export default PropTypes.shape({
    /** The specific type of chat */
    chatType: PropTypes.oneOf(['', ..._.values(CONST.REPORT.CHAT_TYPE)]),

    /** List of icons for report participants */
    icons: PropTypes.arrayOf(avatarPropTypes),

    /** Whether the user is not an admin of policyExpenseChat chat */
    isOwnPolicyExpenseChat: PropTypes.bool,

    /** Indicates if the report is pinned to the LHN or not */
    isPinned: PropTypes.bool,

    /** Whether we're waiting on submitter to add a bank account */
    isWaitingOnBankAccount: PropTypes.bool,

    /** The accountID of the last message's actor */
    lastActorAccountID: PropTypes.number,

    /** The text of the last message on the report */
    lastMessageText: PropTypes.string,

    /** The time of the last message on the report */
    lastVisibleActionCreated: PropTypes.string,

    /** The time when user read the last message */
    lastReadTime: PropTypes.string,

    /** The current user's notification preference for this report */
    notificationPreference: PropTypes.oneOfType([
        // Some old reports have numbers for the notification preference
        PropTypes.number,
        PropTypes.string,
    ]),

    /** The policy name to use for an archived report */
    oldPolicyName: PropTypes.string,

    /** The accountID of the report owner */
    ownerAccountID: PropTypes.number,

    /** List of accountIDs of participants of the report */
    participantAccountIDs: PropTypes.arrayOf(PropTypes.number),

    /** List of accountIDs of visible members of the report */
    visibleChatMemberAccountIDs: PropTypes.arrayOf(PropTypes.number),

    /** Linked policy's ID */
    policyID: PropTypes.string,

    /** Name of the report */
    reportName: PropTypes.string,

    /** ID of the report */
    reportID: PropTypes.string,

    /** The state that the report is currently in */
    stateNum: PropTypes.oneOf(_.values(CONST.REPORT.STATE_NUM)),

    /** The status of the current report */
    statusNum: PropTypes.oneOf(_.values(CONST.REPORT.STATUS_NUM)),

    /** Which user role is capable of posting messages on the report */
    writeCapability: PropTypes.oneOf(_.values(CONST.REPORT.WRITE_CAPABILITIES)),

    /** Field-specific pending states for offline UI status */
    pendingFields: PropTypes.objectOf(PropTypes.string),

    /** Custom fields attached to the report */
    reportFields: PropTypes.objectOf(PropTypes.string),
});
