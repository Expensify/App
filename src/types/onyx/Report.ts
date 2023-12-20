import {ValueOf} from 'type-fest';
import CONST from '@src/CONST';
import * as OnyxCommon from './OnyxCommon';
import PersonalDetails from './PersonalDetails';

type NotificationPreference = ValueOf<typeof CONST.REPORT.NOTIFICATION_PREFERENCE>;

type WriteCapability = ValueOf<typeof CONST.REPORT.WRITE_CAPABILITIES>;

type Note = {
    note: string;
    errors?: OnyxCommon.Errors;
    pendingAction?: OnyxCommon.PendingAction;
};

type Report = {
    /** The specific type of chat */
    chatType?: ValueOf<typeof CONST.REPORT.CHAT_TYPE>;

    /** Whether the report has a child that is an outstanding money request that is awaiting action from the current user */
    hasOutstandingChildRequest?: boolean;

    /** List of icons for report participants */
    icons?: OnyxCommon.Icon[];

    /** Whether the user is not an admin of policyExpenseChat chat */
    isOwnPolicyExpenseChat?: boolean;

    /** Whether the report is policyExpenseChat */
    isPolicyExpenseChat?: boolean;

    /** Indicates if the report is pinned to the LHN or not */
    isPinned?: boolean;

    /** The text of the last message on the report */
    lastMessageText?: string;

    /** The timestamp of the last message on the report */
    lastMessageTimestamp?: number;

    /** The time of the last message on the report */
    lastVisibleActionCreated?: string;

    /** The time of the last read of the report */
    lastReadCreated?: string;

    /** The last time the report was visited */
    lastReadTime?: string;

    /** The sequence number of the last report visit */
    lastReadSequenceNumber?: number;

    /** The time of the last mention of the report */
    lastMentionedTime?: string | null;

    /** The current user's notification preference for this report */
    notificationPreference?: NotificationPreference;

    /** The policy name to use */
    policyName?: string | null;

    /** The policy name to use for an archived report */
    oldPolicyName?: string;

    /** Whether the report has parent access */
    hasParentAccess?: boolean;

    /** Description of the report */
    description?: string;

    /** Whether the parent action was deleted */
    isDeletedParentAction?: boolean;

    /** Linked policy's ID */
    policyID?: string;

    /** Name of the report */
    reportName?: string;

    /** ID of the report */
    reportID: string;

    /** ID of the chat report */
    chatReportID?: string;

    /** The state of the report */
    state?: ValueOf<typeof CONST.REPORT.STATE>;

    /** The state that the report is currently in */
    stateNum?: ValueOf<typeof CONST.REPORT.STATE_NUM>;

    /** The status of the current report */
    statusNum?: ValueOf<typeof CONST.REPORT.STATUS>;

    /** Which user role is capable of posting messages on the report */
    writeCapability?: WriteCapability;

    /** The report type */
    type?: string;

    /** If the admin room should be opened */
    openOnAdminRoom?: boolean;

    /** The report visibility */
    visibility?: ValueOf<typeof CONST.REPORT.VISIBILITY>;

    /** Report cached total */
    cachedTotal?: string;

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
    parentReportActionIDs?: number[];
    errorFields?: OnyxCommon.ErrorFields;

    /** Whether the report is waiting on a bank account */
    isWaitingOnBankAccount?: boolean;

    /** Whether the report is cancelled */
    isCancelledIOU?: boolean;

    /** Whether the last message was deleted */
    isLastMessageDeletedParentAction?: boolean;

    /** The ID of the IOU report */
    iouReportID?: string;

    /** Total amount of money owed for IOU report */
    iouReportAmount?: number;

    /** Is this action pending? */
    pendingAction?: OnyxCommon.PendingAction;

    /** Pending fields for the report */
    pendingFields?: Record<string, OnyxCommon.PendingAction>;

    /** The ID of the preexisting report (it is possible that we optimistically created a Report for which a report already exists) */
    preexistingReportID?: string;

    /** If the report contains nonreimbursable expenses, send the nonreimbursable total */
    nonReimbursableTotal?: number;
    isHidden?: boolean;
    isChatRoom?: boolean;
    participantsList?: Array<Partial<PersonalDetails>>;
    text?: string;
    privateNotes?: Record<number, Note>;
    isLoadingPrivateNotes?: boolean;
};

export default Report;

export type {NotificationPreference, WriteCapability};
