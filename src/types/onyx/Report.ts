import type {ValueOf} from 'type-fest';
import type CONST from '@src/CONST';
import type ONYXKEYS from '@src/ONYXKEYS';
import type CollectionDataSet from '@src/types/utils/CollectionDataSet';
import type * as OnyxCommon from './OnyxCommon';
import type {PolicyReportField} from './Policy';
import type {TripData} from './TripData';

/** Preference that defines how regular the chat notifications are sent to the user */
type NotificationPreference = ValueOf<typeof CONST.REPORT.NOTIFICATION_PREFERENCE>;

/** Defines who's able to write messages in the chat */
type WriteCapability = ValueOf<typeof CONST.REPORT.WRITE_CAPABILITIES>;

/** Defines which users have access to the chat */
type RoomVisibility = ValueOf<typeof CONST.REPORT.VISIBILITY>;

/** Model of report private note */
type Note = OnyxCommon.OnyxValueWithOfflineFeedback<{
    /** Content of the note */
    note: string;

    /** Collection of errors to show to the user */
    errors?: OnyxCommon.Errors;
}>;

/** Report participant properties */
type Participant = OnyxCommon.OnyxValueWithOfflineFeedback<{
    /** What is the role of the participant in the report */
    role?: ValueOf<typeof CONST.REPORT.ROLE>;

    /** Whether the participant is visible in the report */
    notificationPreference: NotificationPreference;

    /** Permissions granted to the participant */
    permissions?: Array<ValueOf<typeof CONST.REPORT.PERMISSIONS>>;
}>;

/** Types of invoice receivers in a report */
type InvoiceReceiver =
    | {
          /** An individual */
          type: typeof CONST.REPORT.INVOICE_RECEIVER_TYPE.INDIVIDUAL;

          /** Account ID of the user */
          accountID: number;
      }
    | {
          /** A business */
          type: typeof CONST.REPORT.INVOICE_RECEIVER_TYPE.BUSINESS;

          /** ID of the policy */
          policyID: string;
      };

/** Type of invoice receiver */
type InvoiceReceiverType = InvoiceReceiver['type'];

/** Record of report participants, indexed by their accountID */
type Participants = Record<number, Participant>;

/** Report next step */
type ReportNextStep = {
    /** The message key */
    messageKey: ValueOf<typeof CONST.NEXT_STEP.MESSAGE_KEY>;

    /** The icon */
    icon: ValueOf<typeof CONST.NEXT_STEP.ICONS>;

    /** The account ID of the user who is required to take action. This could be -1 which translates to "an admin" */
    actorAccountID?: number;

    /** The ETA (if applicable, e.g. expected reimbursement date) */
    eta?: {
        /** The ETA key */
        etaKey?: ValueOf<typeof CONST.NEXT_STEP.ETA_KEY>;

        /** The ETA date time */
        dateTime?: string;
    };
};

/** Model of report data */
type Report = OnyxCommon.OnyxValueWithOfflineFeedback<
    {
        /** The URL of the Group Chat report custom avatar */
        avatarUrl?: string;

        /** The date the report was created */
        created?: string;

        /** The date the report was submitted */
        submitted?: string;

        /** The date the report was approved */
        approved?: string;

        /** The specific type of chat */
        chatType?: ValueOf<typeof CONST.REPORT.CHAT_TYPE>;

        /** Whether the report has a child that is an outstanding expense that is awaiting action from the current user */
        hasOutstandingChildRequest?: boolean;

        /** Whether the report has a child task that is awaiting action from the current user */
        hasOutstandingChildTask?: boolean;

        /** Whether the user is not an admin of policyExpenseChat chat */
        isOwnPolicyExpenseChat?: boolean;

        /** Indicates if the report is pinned to the LHN or not */
        isPinned?: boolean;

        /** The text of the last message on the report */
        lastMessageText?: string;

        /** The time of the last message on the report */
        lastVisibleActionCreated?: string;

        /** The time when user read the last message */
        lastReadTime?: string;

        /** The sequence number of the last report visit */
        lastReadSequenceNumber?: number;

        /** The time of the last mention of the report */
        lastMentionedTime?: string | null;

        /** The policy avatar to use, if any */
        policyAvatar?: string | null;

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

        /** The state that the report is currently in */
        stateNum?: ValueOf<typeof CONST.REPORT.STATE_NUM>;

        /** The status of the current report */
        statusNum?: ValueOf<typeof CONST.REPORT.STATUS_NUM>;

        /** Which user role is capable of posting messages on the report */
        writeCapability?: WriteCapability;

        /** The report type */
        type?: string;

        /** The report visibility */
        visibility?: RoomVisibility;

        /** Invoice room receiver data */
        invoiceReceiver?: InvoiceReceiver;

        /** Number of transactions in the report */
        transactionCount?: number;

        /** ID of the parent report of the current report, if it exists */
        parentReportID?: string;

        /** ID of the parent report action of the current report, if it exists */
        parentReportActionID?: string;

        /** Account ID of the report manager */
        managerID?: number;

        /** When was the last visible action last modified */
        lastVisibleActionLastModified?: string;

        /** HTML content of the last message in the report */
        lastMessageHtml?: string;

        /** Account ID of the user that sent the last message */
        lastActorAccountID?: number;

        /** The type of the last action */
        lastActionType?: ValueOf<typeof CONST.REPORT.ACTIONS.TYPE>;

        /** Account ID of the report owner */
        ownerAccountID?: number;

        /** Collection of report participants, indexed by their accountID */
        participants?: Participants;

        /** For expense reports, this is the total amount approved */
        total?: number;

        /** For expense reports, this is the total amount requested */
        unheldTotal?: number;

        /** Total amount of unheld non-reimbursable transactions in an expense report */
        unheldNonReimbursableTotal?: number;

        /** For expense reports, this is the currency of the expense */
        currency?: string;

        /** Collection of errors that exist in report fields */
        errorFields?: OnyxCommon.ErrorFields;

        /** Errors used by Search to show RBR */
        errors?: OnyxCommon.Errors;

        /** Whether the report is waiting on a bank account */
        isWaitingOnBankAccount?: boolean;

        /** Whether the report is cancelled */
        isCancelledIOU?: boolean;

        /** Whether the report has been retracted */
        hasReportBeenRetracted?: boolean;

        /** Whether the report has been reopened */
        hasReportBeenReopened?: boolean;

        /** Whether the report has been exported to integration */
        isExportedToIntegration?: boolean;

        /** Whether the report has any export errors */
        hasExportError?: boolean;

        /** The ID of the IOU report */
        iouReportID?: string;

        /** The ID of the preexisting report (it is possible that we optimistically created a Report for which a report already exists) */
        preexistingReportID?: string;

        /** If the report contains nonreimbursable expenses, send the nonreimbursable total */
        nonReimbursableTotal?: number;

        /** Collection of participant private notes, indexed by their accountID */
        privateNotes?: Record<number, Note>;

        /** Collection of policy report fields, indexed by their fieldID */
        fieldList?: Record<string, PolicyReportField>;

        /** Collection of report permissions granted to the current user */
        permissions?: Array<ValueOf<typeof CONST.REPORT.PERMISSIONS>>;

        /** The trip data for a trip room */
        tripData?: {
            /** The start date of a trip */
            startDate?: string;

            /** The end date of a trip */
            endDate?: string;

            /** The trip ID in spotnana */
            tripID: string;

            /** The trip data */
            payload?: TripData;
        };

        /** The report's welcome message */
        welcomeMessage?: string;

        /** The report's next step */
        nextStep?: ReportNextStep;
    },
    'addWorkspaceRoom' | 'avatar' | 'createChat' | 'partial' | 'reimbursed' | 'preview' | 'createReport' | 'reportName'
>;

/** Collection of reports, indexed by report_{reportID} */
type ReportCollectionDataSet = CollectionDataSet<typeof ONYXKEYS.COLLECTION.REPORT>;

export default Report;

export type {NotificationPreference, RoomVisibility, WriteCapability, Note, ReportCollectionDataSet, Participant, Participants, InvoiceReceiver, InvoiceReceiverType, ReportNextStep};
