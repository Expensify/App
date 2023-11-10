import {ValueOf} from 'type-fest';
import CONST from '@src/CONST';
import * as OnyxCommon from './OnyxCommon';

type Report = {
    /** The specific type of chat */
    chatType?: ValueOf<typeof CONST.REPORT.CHAT_TYPE>;

    /** Whether there is an outstanding amount in IOU */
    hasOutstandingIOU?: boolean;

    /** Whether the report has a child that is an outstanding money request that is awaiting action from the current user */
    hasOutstandingChildRequest?: boolean;

    /** List of icons for report participants */
    icons?: OnyxCommon.Icon[];

    /** Whether the user is not an admin of policyExpenseChat chat */
    isOwnPolicyExpenseChat?: boolean;

    /** Indicates if the report is pinned to the LHN or not */
    isPinned?: boolean;

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

    /** Linked policy's ID */
    policyID?: string;

    /** Name of the report */
    reportName?: string;

    /** ID of the report */
    reportID: string;

    /** The state that the report is currently in */
    stateNum?: ValueOf<typeof CONST.REPORT.STATE_NUM>;

    /** The status of the current report */
    statusNum?: ValueOf<typeof CONST.REPORT.STATUS>;

    /** Which user role is capable of posting messages on the report */
    writeCapability?: ValueOf<typeof CONST.REPORT.WRITE_CAPABILITIES>;

    /** The report type */
    type?: string;

    lastMessageTranslationKey?: string;
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
    total?: number;
    currency?: string;

    /** Whether the report is waiting on a bank account */
    isWaitingOnBankAccount?: boolean;

    /** Whether the last message was deleted */
    isLastMessageDeletedParentAction?: boolean;

    /** The ID of the IOU report */
    iouReportID?: string;

    /** Total amount of money owed for IOU report */
    iouReportAmount?: number;

    /** Pending fields for the report */
    pendingFields?: Record<string, OnyxCommon.PendingAction>;

    /** The ID of the preexisting report (it is possible that we optimistically created a Report for which a report already exists) */
    preexistingReportID?: string;

    /** If the report contains nonreimbursable expenses, send the nonreimbursable total */
    nonReimbursableTotal?: number;
};

export default Report;
