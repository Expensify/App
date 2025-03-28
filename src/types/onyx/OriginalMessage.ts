import type {ValueOf} from 'type-fest';
import type CONST from '@src/CONST';
import type DeepValueOf from '@src/types/utils/DeepValueOf';
import type {OldDotOriginalMessageMap} from './OldDotAction';
import type {AllConnectionName} from './Policy';
import type ReportActionName from './ReportActionName';

/** Types of join workspace resolutions */
type JoinWorkspaceResolution = ValueOf<typeof CONST.REPORT.ACTIONABLE_MENTION_JOIN_WORKSPACE_RESOLUTION>;

/** Types of payments methods */
type PaymentMethodType = DeepValueOf<typeof CONST.IOU.PAYMENT_TYPE | typeof CONST.IOU.REPORT_ACTION_TYPE | typeof CONST.WALLET.TRANSFER_METHOD_TYPE>;

/** Types of sources of original message */
type OriginalMessageSource = 'Chronos' | 'email' | 'ios' | 'android' | 'web' | '';

/** Details provided when sending money */
type IOUDetails = {
    /** How much was sent */
    amount: number;

    /** Optional comment */
    comment: string;

    /** Currency of the money sent */
    currency: string;
};

/** Model of `IOU` report action */
type OriginalMessageIOU = {
    /** The ID of the `IOU` transaction */
    IOUTransactionID?: string;

    /** ID of the `IOU` report */
    IOUReportID?: string;

    /** ID of the expense report */
    expenseReportID?: string;

    /** How much was transactioned */
    amount: number;

    /** Was the action created automatically, not by a human */
    automaticAction?: boolean;

    /** Optional comment */
    comment?: string;

    /** Currency of the transactioned money */
    currency: string;

    /** When was the `IOU` last modified */
    lastModified?: string;

    /** Who participated in the transaction, by accountID */
    participantAccountIDs?: number[];

    /** Type of `IOU` report action */
    type: ValueOf<typeof CONST.IOU.REPORT_ACTION_TYPE>;

    /** If the action was cancelled, this is the reason for the cancellation */
    cancellationReason?: string;

    /** Type of payment method used in transaction */
    paymentType?: PaymentMethodType;

    /** Timestamp of when the `IOU` report action was deleted */
    deleted?: string;

    /** Only exists when we are sending money */
    IOUDetails?: IOUDetails;

    /** Collection of accountIDs of users mentioned in message */
    whisperedTo?: number[];
};

/** Names of moderation decisions */
type DecisionName = ValueOf<
    Pick<
        typeof CONST.MODERATION,
        'MODERATOR_DECISION_PENDING' | 'MODERATOR_DECISION_PENDING_HIDE' | 'MODERATOR_DECISION_PENDING_REMOVE' | 'MODERATOR_DECISION_APPROVED' | 'MODERATOR_DECISION_HIDDEN'
    >
>;

/** Model of moderator decision */
type Decision = {
    /** Name of the decision */
    decision: DecisionName;

    /** When was the decision made */
    timestamp?: string;
};

/** Model of user reaction */
type User = {
    /** Account ID of the user that reacted to the comment */
    accountID: number;

    /** What's the skin tone of the user reaction */
    skinTone: number;
};

/** Model of comment reaction */
type Reaction = {
    /** Which emoji was used to react to the comment */
    emoji: string;

    /** Which users reacted with this emoji */
    users: User[];
};

/** Model of `add comment` report action */
type OriginalMessageAddComment = {
    /** HTML content of the comment */
    html: string;

    /** Origin of the comment */
    source?: OriginalMessageSource;

    /** When was the comment last modified */
    lastModified?: string;

    /** ID of the task report */
    taskReportID?: string;

    /** Collection of accountIDs of users mentioned in message */
    whisperedTo: number[];

    /** List accountIDs are mentioned in message */
    mentionedAccountIDs?: number[];
};

/** Model of `actionable mention whisper` report action */
type OriginalMessageActionableMentionWhisper = {
    /** Account IDs of users that aren't members of the room  */
    inviteeAccountIDs: number[];

    /** Decision on whether to invite users that were mentioned but aren't members or do nothing */
    resolution?: ValueOf<typeof CONST.REPORT.ACTIONABLE_MENTION_WHISPER_RESOLUTION> | null;

    /** Collection of accountIDs of users mentioned in message */
    whisperedTo?: number[];
};

/** Model of `actionable report mention whisper` report action */
type OriginalMessageActionableReportMentionWhisper = {
    /** Decision on whether to create a report that were mentioned but doesn't exist or do nothing */
    resolution?: ValueOf<typeof CONST.REPORT.ACTIONABLE_REPORT_MENTION_WHISPER_RESOLUTION> | null;

    /** Collection of accountIDs of users mentioned in message */
    whisperedTo?: number[];
};

/** Model of `submitted` report action */
type OriginalMessageSubmitted = {
    /** Approved expense amount */
    amount: number;

    /** Currency of the approved expense amount */
    currency: string;

    /** Report ID of the expense */
    expenseReportID: string;

    /** Was the report submitted via harvesting (delayed submit) */
    harvesting?: boolean;
};

/** Model of `closed` report action */
type OriginalMessageClosed = {
    /** Name of the policy */
    policyName: string;

    /** What was the reason to close the report */
    reason: ValueOf<typeof CONST.REPORT.ARCHIVE_REASON>;

    /** When was the message last modified */
    lastModified?: string;

    /** If the report was closed because accounts got merged, then this is the new account ID */
    newAccountID?: number;

    /** If the report was closed because accounts got merged, then this is the old account ID */
    oldAccountID?: number;

    /** Name of the invoice receiver's policy */
    receiverPolicyName?: string;
};

/** Model of `renamed` report action, created when chat rooms get renamed */
type OriginalMessageRenamed = {
    /** Renamed room comment */
    html: string;

    /** When was report action last modified */
    lastModified: string;

    /** Old room name */
    oldName: string;

    /** New room name */
    newName: string;
};

/** Model of Chronos OOO Timestamp */
type ChronosOOOTimestamp = {
    /** Date timestamp */
    date: string;
};

/** Model of Chronos OOO Event */
type ChronosOOOEvent = {
    /** ID of the OOO event */
    id: string;

    /** How many days will the user be OOO */
    lengthInDays: number;

    /** Description of the OOO state */
    summary: string;

    /** When will the OOO state start */
    start: ChronosOOOTimestamp;

    /** When will the OOO state end */
    end: ChronosOOOTimestamp;
};

/** Model of `Chronos OOO List` report action */
type OriginalMessageChronosOOOList = {
    /** Collection of OOO events to show in report action */
    events: ChronosOOOEvent[];
};

/** Model of `report preview` report action */
type OriginalMessageReportPreview = {
    /** ID of the report to be previewed */
    linkedReportID: string;

    /** Collection of accountIDs of users mentioned in report */
    whisperedTo?: number[];
};

/** Model of change log */
type OriginalMessageChangeLog = {
    /** Account IDs of users that either got invited or removed from the room */
    targetAccountIDs?: number[];

    /** Name of the chat room */
    roomName?: string;

    /** Description of the chat room */
    description?: string;

    /** ID of the report */
    reportID?: number;

    /** Old name of the workspace */
    oldName?: string;

    /** New name of the workspace */
    newName?: string;

    /** Email of user */
    email?: string;

    /** Role of user */
    role?: string;

    /** When was it last modified */
    lastModified?: string;

    /** New role of user or new value of the category/tag field
     * The user role will be of type string and category/tag value (enabled/disable)
     * will be of type boolean.
     */
    newValue?: boolean | string;

    /** Old role of user or old value (enabled/disable) of the category/tag field.
     * The user role will be of type string and category/tag value (enabled/disable)
     * will be of type boolean.
     */
    oldValue?: boolean | string;

    /** Name of connection */
    connectionName?: AllConnectionName;

    /** Name of the added category */
    categoryName?: string;
};

/** Model of change log */
type OriginalMessagePolicyChangeLog = {
    /** Account IDs of users that either got invited or removed from the room */
    targetAccountIDs?: number[];

    /** Name of the chat room */
    roomName?: string;

    /** Description of the chat room */
    description?: string;

    /** ID of the report */
    reportID?: number;

    /** Old name of the workspace/tag */
    oldName?: string;

    /** New name of the workspace/tag */
    newName?: string;

    /** Email of user */
    email?: string;

    /** Role of user */
    role?: string;

    /** When was it last modified */
    lastModified?: string;

    /** Old currency of the workspace */
    oldCurrency?: string;

    /** New currency of the workspace */
    newCurrency?: string;

    /** Old frequency of the workspace */
    oldFrequency?: ValueOf<typeof CONST.POLICY.AUTO_REPORTING_FREQUENCIES>;

    /** New frequency of the workspace */
    newFrequency?: ValueOf<typeof CONST.POLICY.AUTO_REPORTING_FREQUENCIES>;

    /** Name of connection */
    connectionName?: AllConnectionName;

    /** Name of the added category */
    categoryName?: string;

    /** Name of the updated field */
    updatedField?: string;

    /** Old value for max expense amount with no receipt */
    oldMaxExpenseAmountNoReceipt?: number;

    /** New value for max expense amount with no receipt */
    newMaxExpenseAmountNoReceipt?: number;

    /** Currency of the policy */
    currency?: string;

    /** Old value for max expense amount for violations */
    oldMaxExpenseAmount?: number;

    /** New value for max expense amount for violations */
    newMaxExpenseAmount?: number;

    /** Old default billable value */
    oldDefaultBillable?: string;

    /** New default billable value */
    newDefaultBillable?: string;

    /** value -- returned when updating "Auto-approve compliant reports" */
    value?: boolean;

    /** New desciption */
    newDescription?: string;

    /** Old desciption */
    oldDescription?: string;

    /** Report field type */
    fieldType?: string;

    /** Report field name */
    fieldName?: string;

    /** Custom unit name */
    customUnitName?: string;

    /** Custom unit name */
    rateName?: string;

    /** Added/Updated tag name */
    tagName?: string;

    /** Updated tag list name */
    tagListName?: string;

    /** Updated tag enabled/disabled value */
    enabled?: boolean;

    /** Default value of a report field */
    defaultValue?: string;

    /** field ID of a report field */
    fieldID?: string;

    /**  update type of a report field */
    updateType?: string;

    /** New role of user or new value of the category/tag field */
    newValue?: boolean | string;

    /** Old role of user or old value of the category/tag field */
    oldValue?: boolean | string;
};

/** Model of `join policy` report action */
type OriginalMessageJoinPolicy = {
    /** What was the invited user decision */
    choice: JoinWorkspaceResolution;

    /** ID of the affected policy */
    policyID: string;

    /** AccountID for the user requesting to join the policy */
    accountID?: number;
};

/** Model of `modified expense` report action */
type OriginalMessageModifiedExpense = {
    /** Old content of the comment */
    oldComment?: string;

    /** Edited content of the comment */
    newComment?: string;

    /** Edited merchant name */
    merchant?: string;

    /** Old creation date timestamp */
    oldCreated?: string;

    /** Edited creation date timestamp */
    created?: string;

    /** Old merchant name */
    oldMerchant?: string;

    /** Old expense amount */
    oldAmount?: number;

    /** Edited expense amount */
    amount?: number;

    /** Old expense amount currency  */
    oldCurrency?: string;

    /** Edited expense amount currency */
    currency?: string;

    /** Edited expense category */
    category?: string;

    /** Old expense category */
    oldCategory?: string;

    /** Edited expense tag */
    tag?: string;

    /** Old expense tag */
    oldTag?: string;

    /** Edited billable */
    billable?: string;

    /** Old billable */
    oldBillable?: string;

    /** Old expense tag amount */
    oldTaxAmount?: number;

    /** Edited expense tax amount */
    taxAmount?: number;

    /** Edited expense tax rate */
    taxRate?: string;

    /** Old expense tax rate */
    oldTaxRate?: string;

    /** Edited expense reimbursable */
    reimbursable?: string;

    /** Old expense reimbursable */
    oldReimbursable?: string;

    /** Collection of accountIDs of users mentioned in expense report */
    whisperedTo?: number[];

    /** The ID of moved report */
    movedToReportID?: string;

    /** The old stringify list of attendees */
    oldAttendees?: string;

    /** The stringify list of attendees */
    attendees?: string;
};

/** Model of the `deleted transaction` report action */
type OriginalMessageDeletedTransaction = {
    /** The merchant of the transaction */
    merchant?: string;

    /** The amount of the transaction */
    amount?: number;

    /** The currency of the transaction */
    currency?: string;
};

/** Model of `reimbursement queued` report action */
type OriginalMessageReimbursementQueued = {
    /** How is the payment getting reimbursed */
    paymentType: DeepValueOf<typeof CONST.IOU.PAYMENT_TYPE>;
};

/** Model of `actionable tracked expense whisper` report action */
type OriginalMessageActionableTrackedExpenseWhisper = {
    /** ID of the transaction */
    transactionID: string;

    /** When was the tracked expense whisper last modified */
    lastModified: string;

    /** What was the decision of the user */
    resolution?: ValueOf<typeof CONST.REPORT.ACTIONABLE_TRACK_EXPENSE_WHISPER_RESOLUTION>;
};

/** Model of `reimbursement dequeued` report action */
type OriginalMessageReimbursementDequeued = {
    /** Why the reimbursement was cancelled */
    cancellationReason: ValueOf<typeof CONST.REPORT.CANCEL_PAYMENT_REASONS>;

    /** ID of the `expense` report */
    expenseReportID?: string;

    /** Amount that wasn't reimbursed */
    amount: number;

    /** Currency of the money that wasn't reimbursed */
    currency: string;
};

/** Model of `CHANGEPOLICY` report action */
type OriginalMessageChangePolicy = {
    /** ID of the old policy */
    fromPolicy: string | undefined;

    /** ID of the new policy */
    toPolicy: string;
};

/** Model of `moved` report action */
type OriginalMessageMoved = {
    /** ID of the old policy */
    fromPolicyID: string | undefined;

    /** ID of the new policy */
    toPolicyID: string;

    /** ID of the new parent report */
    newParentReportID: string;

    /** ID of the moved report */
    movedReportID: string;
};

/** Model of `dismissed violation` report action */
type OriginalMessageDismissedViolation = {
    /** Why the violation was dismissed */
    reason: string;

    /** Name of the violation */
    violationName: string;
};

/** Model of `trip room preview` report action */
type OriginalMessageTripRoomPreview = {
    /** ID of the report to be previewed */
    linkedReportID: string;

    /** When was report action last modified */
    lastModified?: string;

    /** Collection of accountIDs of users mentioned in report */
    whisperedTo?: number[];
};

/** Model of `approved` report action */
type OriginalMessageApproved = {
    /** Approved expense amount */
    amount: number;

    /** Was the action created automatically, not by a human */
    automaticAction?: boolean;

    /** Currency of the approved expense amount */
    currency: string;

    /** Report ID of the expense */
    expenseReportID: string;
};

/** Model of `forwarded` report action */
type OriginalMessageForwarded = {
    /** Forwarded expense amount */
    amount: number;

    /** Was the action created automatically, not by a human */
    automaticAction?: boolean;

    /** Currency of the forwarded expense amount */
    currency: string;

    /** Report ID of the expense */
    expenseReportID: string;
};

/**
 *
 */
type OriginalMessageExportIntegration = {
    /**
     * Whether the export was done via an automation
     */
    automaticAction: false;

    /**
     * The integration that was exported to (display text)
     */
    label: string;

    /**
     *
     */
    lastModified: string;

    /**
     * Whether the report was manually marked as exported
     */
    markedManually: boolean;

    /**
     * An list of URLs to the report in the integration for company card expenses
     */
    nonReimbursableUrls?: string[];

    /**
     * An list of URLs to the report in the integration for out of pocket expenses
     */
    reimbursableUrls?: string[];
};

/** Model of `unapproved` report action */
type OriginalMessageUnapproved = {
    /** Unapproved expense amount */
    amount: number;

    /** Currency of the unapproved expense amount */
    currency: string;

    /** Report ID of the expense */
    expenseReportID: string;
};

/** Model of `Removed From Approval Chain` report action */
type OriginalMessageRemovedFromApprovalChain = {
    /** The submitter IDs whose approval chains changed such that the approver was removed from their approval chains */
    submittersAccountIDs: number[];

    /** The accountID of the approver who was removed from the submitter's approval chain */
    whisperedTo: number[];
};

/** Model of `Demoted From Workspace` report action */
type OriginalMessageDemotedFromWorkspace = {
    /** The policy name */
    policyName: string;

    /** The old role of the employee that is being demoted */
    oldRole: string;

    /** The accountID of the member who was demoted from workspace */
    whisperedTo: number[];
};

/**
 * Model of `Add payment card` report action
 */
type OriginalMessageAddPaymentCard = Record<string, never>;

/**
 * Original message for INTEGRATIONSYNCFAILED actions
 */
type OriginalMessageIntegrationSyncFailed = {
    /** The user friendly connection name */
    label: string;

    /** The source of the connection sync */
    source: string;

    /** The error message from Integration Server */
    errorMessage: string;
};

/**
 * Model of CARD_ISSUED, CARD_MISSING_ADDRESS, and CARD_ISSUED_VIRTUAL actions
 */
type OriginalMessageCard = {
    /** The id of the user the card was assigned to */
    assigneeAccountID: number;

    /** The id of the card */
    cardID: number;
};

/**
 * Original message for CARD_ISSUED, CARD_MISSING_ADDRESS, CARD_ASSIGNED and CARD_ISSUED_VIRTUAL actions
 */
type IssueNewCardOriginalMessage = OriginalMessage<
    | typeof CONST.REPORT.ACTIONS.TYPE.CARD_MISSING_ADDRESS
    | typeof CONST.REPORT.ACTIONS.TYPE.CARD_ISSUED
    | typeof CONST.REPORT.ACTIONS.TYPE.CARD_ISSUED_VIRTUAL
    | typeof CONST.REPORT.ACTIONS.TYPE.CARD_ASSIGNED
>;

/** The map type of original message */
/* eslint-disable jsdoc/require-jsdoc */
type OriginalMessageMap = {
    [CONST.REPORT.ACTIONS.TYPE.ACTIONABLE_ADD_PAYMENT_CARD]: OriginalMessageAddPaymentCard;
    [CONST.REPORT.ACTIONS.TYPE.ACTIONABLE_JOIN_REQUEST]: OriginalMessageJoinPolicy;
    [CONST.REPORT.ACTIONS.TYPE.ACTIONABLE_MENTION_WHISPER]: OriginalMessageActionableMentionWhisper;
    [CONST.REPORT.ACTIONS.TYPE.ACTIONABLE_REPORT_MENTION_WHISPER]: OriginalMessageActionableReportMentionWhisper;
    [CONST.REPORT.ACTIONS.TYPE.ACTIONABLE_TRACK_EXPENSE_WHISPER]: OriginalMessageActionableTrackedExpenseWhisper;
    [CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT]: OriginalMessageAddComment;
    [CONST.REPORT.ACTIONS.TYPE.APPROVED]: OriginalMessageApproved;
    [CONST.REPORT.ACTIONS.TYPE.CHANGE_FIELD]: never;
    [CONST.REPORT.ACTIONS.TYPE.CHANGE_POLICY]: OriginalMessageChangePolicy;
    [CONST.REPORT.ACTIONS.TYPE.CHANGE_TYPE]: never;
    [CONST.REPORT.ACTIONS.TYPE.CHRONOS_OOO_LIST]: OriginalMessageChronosOOOList;
    [CONST.REPORT.ACTIONS.TYPE.CLOSED]: OriginalMessageClosed;
    [CONST.REPORT.ACTIONS.TYPE.CREATED]: never;
    [CONST.REPORT.ACTIONS.TYPE.DELEGATE_SUBMIT]: never;
    [CONST.REPORT.ACTIONS.TYPE.DISMISSED_VIOLATION]: OriginalMessageDismissedViolation;
    [CONST.REPORT.ACTIONS.TYPE.EXPORTED_TO_CSV]: never;
    [CONST.REPORT.ACTIONS.TYPE.EXPORTED_TO_INTEGRATION]: OriginalMessageExportIntegration;
    [CONST.REPORT.ACTIONS.TYPE.FORWARDED]: OriginalMessageForwarded;
    [CONST.REPORT.ACTIONS.TYPE.HOLD]: never;
    [CONST.REPORT.ACTIONS.TYPE.HOLD_COMMENT]: never;
    [CONST.REPORT.ACTIONS.TYPE.INTEGRATIONS_MESSAGE]: never;
    [CONST.REPORT.ACTIONS.TYPE.IOU]: OriginalMessageIOU;
    [CONST.REPORT.ACTIONS.TYPE.MANAGER_ATTACH_RECEIPT]: never;
    [CONST.REPORT.ACTIONS.TYPE.MANAGER_DETACH_RECEIPT]: never;
    [CONST.REPORT.ACTIONS.TYPE.MARK_REIMBURSED_FROM_INTEGRATION]: never;
    [CONST.REPORT.ACTIONS.TYPE.MARKED_REIMBURSED]: never;
    [CONST.REPORT.ACTIONS.TYPE.MERGED_WITH_CASH_TRANSACTION]: never;
    [CONST.REPORT.ACTIONS.TYPE.MODIFIED_EXPENSE]: OriginalMessageModifiedExpense;
    [CONST.REPORT.ACTIONS.TYPE.MOVED]: OriginalMessageMoved;
    [CONST.REPORT.ACTIONS.TYPE.OUTDATED_BANK_ACCOUNT]: never;
    [CONST.REPORT.ACTIONS.TYPE.REIMBURSED]: never;
    [CONST.REPORT.ACTIONS.TYPE.REIMBURSEMENT_ACH_BOUNCE]: never;
    [CONST.REPORT.ACTIONS.TYPE.REIMBURSEMENT_ACH_CANCELLED]: never;
    [CONST.REPORT.ACTIONS.TYPE.REIMBURSEMENT_ACCOUNT_CHANGED]: never;
    [CONST.REPORT.ACTIONS.TYPE.REIMBURSEMENT_DEQUEUED]: OriginalMessageReimbursementDequeued;
    [CONST.REPORT.ACTIONS.TYPE.REIMBURSEMENT_DELAYED]: never;
    [CONST.REPORT.ACTIONS.TYPE.REIMBURSEMENT_QUEUED]: OriginalMessageReimbursementQueued;
    [CONST.REPORT.ACTIONS.TYPE.REJECTED]: never;
    [CONST.REPORT.ACTIONS.TYPE.REMOVED_FROM_APPROVAL_CHAIN]: OriginalMessageRemovedFromApprovalChain;
    [CONST.REPORT.ACTIONS.TYPE.DEMOTED_FROM_WORKSPACE]: OriginalMessageDemotedFromWorkspace;
    [CONST.REPORT.ACTIONS.TYPE.RENAMED]: OriginalMessageRenamed;
    [CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW]: OriginalMessageReportPreview;
    [CONST.REPORT.ACTIONS.TYPE.RESOLVED_DUPLICATES]: never;
    [CONST.REPORT.ACTIONS.TYPE.SELECTED_FOR_RANDOM_AUDIT]: never;
    [CONST.REPORT.ACTIONS.TYPE.SHARE]: never;
    [CONST.REPORT.ACTIONS.TYPE.STRIPE_PAID]: never;
    [CONST.REPORT.ACTIONS.TYPE.SUBMITTED]: OriginalMessageSubmitted;
    [CONST.REPORT.ACTIONS.TYPE.SUBMITTED_AND_CLOSED]: OriginalMessageSubmitted;
    [CONST.REPORT.ACTIONS.TYPE.TASK_CANCELLED]: never;
    [CONST.REPORT.ACTIONS.TYPE.TASK_COMPLETED]: never;
    [CONST.REPORT.ACTIONS.TYPE.TASK_EDITED]: never;
    [CONST.REPORT.ACTIONS.TYPE.TASK_REOPENED]: never;
    [CONST.REPORT.ACTIONS.TYPE.TAKE_CONTROL]: never;
    [CONST.REPORT.ACTIONS.TYPE.UNAPPROVED]: OriginalMessageUnapproved;
    [CONST.REPORT.ACTIONS.TYPE.UNHOLD]: never;
    [CONST.REPORT.ACTIONS.TYPE.UNSHARE]: never;
    [CONST.REPORT.ACTIONS.TYPE.UPDATE_GROUP_CHAT_MEMBER_ROLE]: never;
    [CONST.REPORT.ACTIONS.TYPE.TRIPPREVIEW]: OriginalMessageTripRoomPreview;
    [CONST.REPORT.ACTIONS.TYPE.REIMBURSEMENT_REQUESTED]: never;
    [CONST.REPORT.ACTIONS.TYPE.REIMBURSEMENT_SETUP]: never;
    [CONST.REPORT.ACTIONS.TYPE.EXPORTED_TO_QUICK_BOOKS]: never;
    [CONST.REPORT.ACTIONS.TYPE.DONATION]: never;
    [CONST.REPORT.ACTIONS.TYPE.DELETED_ACCOUNT]: never;
    [CONST.REPORT.ACTIONS.TYPE.REIMBURSEMENT_REQUESTED]: never;
    [CONST.REPORT.ACTIONS.TYPE.REIMBURSEMENT_SETUP]: never;
    [CONST.REPORT.ACTIONS.TYPE.REIMBURSEMENT_SETUP_REQUESTED]: never;
    [CONST.REPORT.ACTIONS.TYPE.CARD_ISSUED]: OriginalMessageCard;
    [CONST.REPORT.ACTIONS.TYPE.CARD_MISSING_ADDRESS]: OriginalMessageCard;
    [CONST.REPORT.ACTIONS.TYPE.CARD_ISSUED_VIRTUAL]: OriginalMessageCard;
    [CONST.REPORT.ACTIONS.TYPE.CARD_ASSIGNED]: OriginalMessageCard;
    [CONST.REPORT.ACTIONS.TYPE.INTEGRATION_SYNC_FAILED]: OriginalMessageIntegrationSyncFailed;
    [CONST.REPORT.ACTIONS.TYPE.DELETED_TRANSACTION]: OriginalMessageDeletedTransaction;
} & OldDotOriginalMessageMap & {
        [T in ValueOf<typeof CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG>]: OriginalMessagePolicyChangeLog;
    } & {
        [T in ValueOf<typeof CONST.REPORT.ACTIONS.TYPE.ROOM_CHANGE_LOG>]: OriginalMessageChangeLog;
    };

type OriginalMessage<T extends ReportActionName> = OriginalMessageMap[T];

export default OriginalMessage;
export type {
    DecisionName,
    OriginalMessageIOU,
    ChronosOOOEvent,
    PaymentMethodType,
    OriginalMessageSource,
    Reaction,
    Decision,
    OriginalMessageChangeLog,
    JoinWorkspaceResolution,
    OriginalMessageModifiedExpense,
    OriginalMessageExportIntegration,
    IssueNewCardOriginalMessage,
    OriginalMessageChangePolicy,
};
