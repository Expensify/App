import {ValueOf} from 'type-fest';
import CONST from '../../CONST';
import * as OnyxCommon from './OnyxCommon';

type Report = {
    /** The specific type of chat */
    chatType?: ValueOf<typeof CONST.REPORT.CHAT_TYPE>;

    /** Whether there is an outstanding amount in IOU */
    hasOutstandingIOU?: boolean;

    /** List of icons for report participants */
    icons?: OnyxCommon.Icon[];

    /** Are we loading more report actions? */
    isLoadingMoreReportActions?: boolean;

    /** Flag to check if the report actions data are loading */
    isLoadingReportActions?: boolean;

    /** Whether the user is not an admin of policyExpenseChat chat */
    isOwnPolicyExpenseChat?: boolean;

    /** Indicates if the report is pinned to the LHN or not */
    isPinned?: boolean;

    /** The email of the last message's actor */
    lastActorEmail?: string;

    /** The text of the last message on the report */
    lastMessageText?: string;

    /** The time of the last message on the report */
    lastVisibleActionCreated?: string;

    /** The last time the report was visited */
    lastReadTime?: string;

    /** The current user's notification preference for this report */
    notificationPreference?: string | number;

    /** The policy name to use for an archived report */
    oldPolicyName?: string;

    /** The email address of the report owner */
    ownerEmail?: string;

    /** List of primarylogins of participants of the report */
    participants?: string[];

    /** Linked policy's ID */
    policyID?: string;

    /** Name of the report */
    reportName?: string;

    /** ID of the report */
    reportID?: string;

    /** The state that the report is currently in */
    stateNum?: ValueOf<typeof CONST.REPORT.STATE_NUM>;

    /** The status of the current report */
    statusNum?: ValueOf<typeof CONST.REPORT.STATUS>;

    /** Which user role is capable of posting messages on the report */
    writeCapability?: ValueOf<typeof CONST.REPORT.WRITE_CAPABILITIES>;

    /** The report type */
    type?: string;

    parentReportID?: string;
    parentReportActionID?: string;
    isOptimisticReport?: boolean;
    hasDraft?: boolean;
    managerID?: number;
    lastVisibleActionLastModified?: string;
    displayName?: string;
    lastMessageHtml?: string;
    welcomeMessage?: string;
    lastActorAccountID?: number;
    ownerAccountID?: number;
    participantAccountIDs?: number[];
};

export default Report;
