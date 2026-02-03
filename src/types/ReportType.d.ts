import * as CommonTypes from './common';

type ReportType = {
    /** The specific type of chat */
    chatType: '' | 'policyAnnounce' | 'policyAdmins' | 'domainAll' | 'policyRoom' | 'policyExpenseChat';

    /** Whether there is an outstanding amount in IOU */
    hasOutstandingIOU: boolean;

    /** List of icons for report participants */
    icons: CommonTypes.Icon[];

    /** Are we loading more report actions? */
    isLoadingMoreReportActions: boolean;

    /** Flag to check if the report actions data are loading */
    isLoadingReportActions: boolean;

    /** Whether the user is not an admin of policyExpenseChat chat */
    isOwnPolicyExpenseChat: boolean;

    /** Indicates if the report is pinned to the LHN or not */
    isPinned: boolean;

    /** The email of the last message's actor */
    lastActorEmail: string;

    /** The text of the last message on the report */
    lastMessageText: string;

    /** The time of the last message on the report */
    lastVisibleActionCreated: string;

    /** The last time the report was visited */
    lastReadTime: string;

    /** The current user's notification preference for this report */
    notificationPreference: string | number;

    /** The policy name to use for an archived report */
    oldPolicyName: string;

    /** The email address of the report owner */
    ownerEmail: string;

    /** List of primarylogins of participants of the report */
    participants: string[];

    /** Linked policy's ID */
    policyID: string;

    /** Name of the report */
    reportName: string;

    /** ID of the report */
    reportID: string;

    /** The state that the report is currently in */
    stateNum:
        | 0 // OPEN
        | 1 // PROCESSING
        | 2; // SUBMITTED

    /** The status of the current report */
    statusNum:
        | 0 // OPEN
        | 1 // SUBMITTED
        | 2 // CLOSED
        | 3 // APPROVED
        | 4; // REIMBURSED

    /** Which user role is capable of posting messages on the report */
    writeCapability: 'all' | 'admins';

    /** The report type */
    type: string;
};

export default ReportType;
