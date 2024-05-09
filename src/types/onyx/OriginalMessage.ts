import type {ValueOf} from 'type-fest';
import type CONST from '@src/CONST';
import type AssertTypesEqual from '@src/types/utils/AssertTypesEqual';
import type DeepValueOf from '@src/types/utils/DeepValueOf';
import type ReportActionName from './ReportActionName';

type PaymentMethodType = DeepValueOf<typeof CONST.IOU.PAYMENT_TYPE | typeof CONST.IOU.REPORT_ACTION_TYPE | typeof CONST.WALLET.TRANSFER_METHOD_TYPE>;

type OriginalMessageApproved = {
    actionName: typeof CONST.REPORT.ACTIONS.TYPE.APPROVED;
    originalMessage: unknown;
};
type OriginalMessageSource = 'Chronos' | 'email' | 'ios' | 'android' | 'web' | '';

type OriginalMessageHold = {
    actionName: typeof CONST.REPORT.ACTIONS.TYPE.HOLD;
    originalMessage: unknown;
};

type OriginalMessageHoldComment = {
    actionName: typeof CONST.REPORT.ACTIONS.TYPE.HOLD_COMMENT;
    originalMessage: unknown;
};

type OriginalMessageUnHold = {
    actionName: typeof CONST.REPORT.ACTIONS.TYPE.UNHOLD;
    originalMessage: unknown;
};

type IOUDetails = {
    amount: number;
    comment?: string;
    currency: string;
};

type IOUMessage = {
    /** The ID of the iou transaction */
    IOUTransactionID?: string;
    IOUReportID?: string;
    expenseReportID?: string;
    amount: number;
    comment?: string;
    currency: string;
    lastModified?: string;
    participantAccountIDs?: number[];
    type: ValueOf<typeof CONST.IOU.REPORT_ACTION_TYPE>;
    cancellationReason?: string;
    paymentType?: PaymentMethodType;
    deleted?: string;
    /** Only exists when we are sending money */
    IOUDetails?: IOUDetails;
    whisperedTo?: number[];
};

type ReimbursementDeQueuedMessage = {
    cancellationReason: string;
    expenseReportID?: string;
    amount: number;
    currency: string;
};

type OriginalMessageIOU = {
    actionName: typeof CONST.REPORT.ACTIONS.TYPE.IOU;
    originalMessage: IOUMessage;
};

type FlagSeverityName = ValueOf<
    Pick<
        typeof CONST.MODERATION,
        'FLAG_SEVERITY_SPAM' | 'FLAG_SEVERITY_INCONSIDERATE' | 'FLAG_SEVERITY_INTIMIDATION' | 'FLAG_SEVERITY_BULLYING' | 'FLAG_SEVERITY_HARASSMENT' | 'FLAG_SEVERITY_ASSAULT'
    >
>;
type FlagSeverity = {
    accountID: number;
    timestamp: string;
};

type DecisionName = ValueOf<
    Pick<
        typeof CONST.MODERATION,
        'MODERATOR_DECISION_PENDING' | 'MODERATOR_DECISION_PENDING_HIDE' | 'MODERATOR_DECISION_PENDING_REMOVE' | 'MODERATOR_DECISION_APPROVED' | 'MODERATOR_DECISION_HIDDEN'
    >
>;
type Decision = {
    decision: DecisionName;
    timestamp?: string;
};

type User = {
    accountID: number;
    skinTone: number;
};

type Reaction = {
    emoji: string;
    users: User[];
};

type Closed = {
    policyName: string;
    reason: ValueOf<typeof CONST.REPORT.ARCHIVE_REASON>;
    lastModified?: string;
    newAccountID?: number;
    oldAccountID?: number;
};

type OriginalMessageAddComment = {
    html: string;
    source?: OriginalMessageSource;
    lastModified?: string;
    taskReportID?: string;
    edits?: string[];
    childReportID?: string;
    isDeletedParentAction?: boolean;
    flags?: Record<FlagSeverityName, FlagSeverity[]>;
    moderationDecisions?: Decision[];
    whisperedTo: number[];
    reactions?: Reaction[];
};

type OriginalMessageActionableMentionWhisper = {
    actionName: typeof CONST.REPORT.ACTIONS.TYPE.ACTIONABLE_MENTION_WHISPER;
    originalMessage: {
        inviteeAccountIDs: number[];
        inviteeEmails: string;
        lastModified: string;
        reportID: number;
        resolution?: ValueOf<typeof CONST.REPORT.ACTIONABLE_MENTION_WHISPER_RESOLUTION> | null;
        whisperedTo?: number[];
    };
};

type OriginalMessageActionableReportMentionWhisper = {
    actionName: typeof CONST.REPORT.ACTIONS.TYPE.ACTIONABLE_REPORT_MENTION_WHISPER;
    originalMessage: {
        reportNames: string[];
        mentionedAccountIDs: number[];
        reportActionID: number;
        reportID: number;
        lastModified: string;
        resolution?: ValueOf<typeof CONST.REPORT.ACTIONABLE_REPORT_MENTION_WHISPER_RESOLUTION> | null;
        whisperedTo?: number[];
    };
};

type OriginalMessageSubmitted = {
    actionName: typeof CONST.REPORT.ACTIONS.TYPE.SUBMITTED;
    originalMessage: unknown;
};

type OriginalMessageClosed = {
    actionName: typeof CONST.REPORT.ACTIONS.TYPE.CLOSED;
    originalMessage: Closed;
};

type OriginalMessageCreated = {
    actionName: typeof CONST.REPORT.ACTIONS.TYPE.CREATED;
    originalMessage?: unknown;
};

type OriginalMessageMarkedReimbursed = {
    actionName: typeof CONST.REPORT.ACTIONS.TYPE.MARKED_REIMBURSED;
    originalMessage?: unknown;
};

type OriginalMessageRenamed = {
    actionName: typeof CONST.REPORT.ACTIONS.TYPE.RENAMED;
    originalMessage: {
        html: string;
        lastModified: string;
        oldName: string;
        newName: string;
    };
};

type ChronosOOOTimestamp = {
    date: string;
    timezone: string;
    // eslint-disable-next-line @typescript-eslint/naming-convention
    timezone_type: number;
};

type ChangeLog = {
    targetAccountIDs?: number[];
    roomName?: string;
    reportID?: number;
};

type ChronosOOOEvent = {
    id: string;
    lengthInDays: number;
    summary: string;
    start: ChronosOOOTimestamp;
    end: ChronosOOOTimestamp;
};

type OriginalMessageChronosOOOList = {
    actionName: typeof CONST.REPORT.ACTIONS.TYPE.CHRONOS_OOO_LIST;
    originalMessage: {
        edits: string[];
        events: ChronosOOOEvent[];
        html: string;
        lastModified: string;
    };
};

type OriginalMessageReportPreview = {
    actionName: typeof CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW;
    originalMessage: {
        linkedReportID: string;
        lastModified?: string;
        whisperedTo?: number[];
    };
};

type OriginalMessagePolicyChangeLog = {
    actionName: ValueOf<typeof CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG>;
    originalMessage: ChangeLog;
};

type OriginalMessageJoinPolicyChangeLog = {
    actionName: typeof CONST.REPORT.ACTIONS.TYPE.ACTIONABLE_JOIN_REQUEST;
    originalMessage: {
        choice: string;
        email: string;
        inviterEmail: string;
        lastModified: string;
        policyID: string;
    };
};

type OriginalMessageRoomChangeLog = {
    actionName: ValueOf<typeof CONST.REPORT.ACTIONS.TYPE.ROOM_CHANGE_LOG>;
    originalMessage: ChangeLog;
};

type OriginalMessagePolicyTask = {
    actionName:
        | typeof CONST.REPORT.ACTIONS.TYPE.TASK_EDITED
        | typeof CONST.REPORT.ACTIONS.TYPE.TASK_CANCELLED
        | typeof CONST.REPORT.ACTIONS.TYPE.TASK_COMPLETED
        | typeof CONST.REPORT.ACTIONS.TYPE.TASK_REOPENED
        | typeof CONST.REPORT.ACTIONS.TYPE.MODIFIED_EXPENSE;
    originalMessage: unknown;
};

type OriginalMessageModifiedExpense = {
    actionName: typeof CONST.REPORT.ACTIONS.TYPE.MODIFIED_EXPENSE;
    originalMessage: {
        oldMerchant?: string;
        merchant?: string;
        oldCurrency?: string;
        currency?: string;
        oldAmount?: number;
        amount?: number;
        oldComment?: string;
        newComment?: string;
        oldCreated?: string;
        created?: string;
        oldCategory?: string;
        category?: string;
        oldTag?: string;
        tag?: string;
        oldTaxAmount?: number;
        taxAmount?: number;
        oldTaxRate?: string;
        taxRate?: string;
        oldBillable?: string;
        billable?: string;
        whisperedTo?: number[];
    };
};

type OriginalMessageReimbursementQueued = {
    actionName: typeof CONST.REPORT.ACTIONS.TYPE.REIMBURSEMENT_QUEUED;
    originalMessage: {
        paymentType: DeepValueOf<typeof CONST.IOU.PAYMENT_TYPE>;
    };
};

type OriginalMessageActionableTrackedExpenseWhisper = {
    actionName: typeof CONST.REPORT.ACTIONS.TYPE.ACTIONABLE_TRACK_EXPENSE_WHISPER;
    originalMessage: {
        transactionID: string;
        lastModified: string;
        resolution?: ValueOf<typeof CONST.REPORT.ACTIONABLE_TRACK_EXPENSE_WHISPER_RESOLUTION>;
    };
};

type OriginalMessageReimbursementDequeued = {
    actionName: typeof CONST.REPORT.ACTIONS.TYPE.REIMBURSEMENT_DEQUEUED;
    originalMessage: {
        expenseReportID: string;
    };
};

type OriginalMessageMoved = {
    actionName: typeof CONST.REPORT.ACTIONS.TYPE.MOVED;
    originalMessage: {
        fromPolicyID: string;
        toPolicyID: string;
        newParentReportID: string;
        movedReportID: string;
    };
};

type OriginalMessageMergedWithCashTransaction = {
    actionName: typeof CONST.REPORT.ACTIONS.TYPE.MERGED_WITH_CASH_TRANSACTION;
    originalMessage: Record<string, never>; // No data is sent with this action
};

type OriginalMessageDismissedViolation = {
    actionName: typeof CONST.REPORT.ACTIONS.TYPE.DISMISSED_VIOLATION;
    originalMessage: {
        reason: string;
        violationName: string;
    };
};

type OriginalMessageMap = {
    [CONST.REPORT.ACTIONS.TYPE.ACTIONABLE_JOIN_REQUEST]: OriginalMessageJoinPolicyChangeLog;
    [CONST.REPORT.ACTIONS.TYPE.ACTIONABLE_MENTION_WHISPER]: OriginalMessageActionableMentionWhisper;
    [CONST.REPORT.ACTIONS.TYPE.ACTIONABLE_REPORT_MENTION_WHISPER]: OriginalMessageActionableReportMentionWhisper;
    [CONST.REPORT.ACTIONS.TYPE.ACTIONABLE_TRACK_EXPENSE_WHISPER]: OriginalMessageActionableTrackedExpenseWhisper;
    [CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT]: OriginalMessageAddComment;
    [CONST.REPORT.ACTIONS.TYPE.APPROVED]: OriginalMessageApproved;
    [CONST.REPORT.ACTIONS.TYPE.CHANGE_FIELD]: never;
    [CONST.REPORT.ACTIONS.TYPE.CHANGE_POLICY]: never;
    [CONST.REPORT.ACTIONS.TYPE.CHANGE_TYPE]: never;
    [CONST.REPORT.ACTIONS.TYPE.CHRONOS_OOO_LIST]: OriginalMessageChronosOOOList;
    [CONST.REPORT.ACTIONS.TYPE.CLOSED]: OriginalMessageClosed;
    [CONST.REPORT.ACTIONS.TYPE.CREATED]: OriginalMessageCreated;
    [CONST.REPORT.ACTIONS.TYPE.DELEGATE_SUBMIT]: never;
    [CONST.REPORT.ACTIONS.TYPE.DELETED_ACCOUNT]: never;
    [CONST.REPORT.ACTIONS.TYPE.DISMISSED_VIOLATION]: OriginalMessageDismissedViolation;
    [CONST.REPORT.ACTIONS.TYPE.DONATION]: never;
    [CONST.REPORT.ACTIONS.TYPE.EXPORTED_TO_CSV]: never;
    [CONST.REPORT.ACTIONS.TYPE.EXPORTED_TO_INTEGRATION]: never;
    [CONST.REPORT.ACTIONS.TYPE.EXPORTED_TO_QUICK_BOOKS]: never;
    [CONST.REPORT.ACTIONS.TYPE.FORWARDED]: never;
    [CONST.REPORT.ACTIONS.TYPE.HOLD]: OriginalMessageHold;
    [CONST.REPORT.ACTIONS.TYPE.HOLD_COMMENT]: OriginalMessageHoldComment;
    [CONST.REPORT.ACTIONS.TYPE.INTEGRATIONS_MESSAGE]: never;
    [CONST.REPORT.ACTIONS.TYPE.IOU]: OriginalMessageIOU;
    [CONST.REPORT.ACTIONS.TYPE.MANAGER_ATTACH_RECEIPT]: never;
    [CONST.REPORT.ACTIONS.TYPE.MANAGER_DETACH_RECEIPT]: never;
    [CONST.REPORT.ACTIONS.TYPE.MARK_REIMBURSED_FROM_INTEGRATION]: never;
    [CONST.REPORT.ACTIONS.TYPE.MARKED_REIMBURSED]: OriginalMessageMarkedReimbursed;
    [CONST.REPORT.ACTIONS.TYPE.MERGED_WITH_CASH_TRANSACTION]: OriginalMessageMergedWithCashTransaction;
    [CONST.REPORT.ACTIONS.TYPE.MODIFIED_EXPENSE]: OriginalMessageModifiedExpense;
    [CONST.REPORT.ACTIONS.TYPE.MOVED]: OriginalMessageMoved;
    [CONST.REPORT.ACTIONS.TYPE.OUTDATED_BANK_ACCOUNT]: never;
    [CONST.REPORT.ACTIONS.TYPE.REIMBURSEMENT_ACH_BOUNCE]: never;
    [CONST.REPORT.ACTIONS.TYPE.REIMBURSEMENT_ACH_CANCELLED]: never;
    [CONST.REPORT.ACTIONS.TYPE.REIMBURSEMENT_ACCOUNT_CHANGED]: never;
    [CONST.REPORT.ACTIONS.TYPE.REIMBURSEMENT_DEQUEUED]: OriginalMessageReimbursementDequeued;
    [CONST.REPORT.ACTIONS.TYPE.REIMBURSEMENT_DELAYED]: never;
    [CONST.REPORT.ACTIONS.TYPE.REIMBURSEMENT_QUEUED]: OriginalMessageReimbursementQueued;
    [CONST.REPORT.ACTIONS.TYPE.REIMBURSEMENT_REQUESTED]: never;
    [CONST.REPORT.ACTIONS.TYPE.REIMBURSEMENT_SETUP]: never;
    [CONST.REPORT.ACTIONS.TYPE.RENAMED]: OriginalMessageRenamed;
    [CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW]: OriginalMessageReportPreview;
    [CONST.REPORT.ACTIONS.TYPE.SELECTED_FOR_RANDOM_AUDIT]: never;
    [CONST.REPORT.ACTIONS.TYPE.SHARE]: never;
    [CONST.REPORT.ACTIONS.TYPE.STRIPE_PAID]: never;
    [CONST.REPORT.ACTIONS.TYPE.SUBMITTED]: OriginalMessageSubmitted;
    [CONST.REPORT.ACTIONS.TYPE.TASK_CANCELLED]: OriginalMessagePolicyTask;
    [CONST.REPORT.ACTIONS.TYPE.TASK_COMPLETED]: OriginalMessagePolicyTask;
    [CONST.REPORT.ACTIONS.TYPE.TASK_EDITED]: OriginalMessagePolicyTask;
    [CONST.REPORT.ACTIONS.TYPE.TASK_REOPENED]: OriginalMessagePolicyTask;
    [CONST.REPORT.ACTIONS.TYPE.TAKE_CONTROL]: never;
    [CONST.REPORT.ACTIONS.TYPE.UNAPPROVED]: never;
    [CONST.REPORT.ACTIONS.TYPE.UNHOLD]: OriginalMessageUnHold;
    [CONST.REPORT.ACTIONS.TYPE.UNSHARE]: never;
    [CONST.REPORT.ACTIONS.TYPE.UPDATE_GROUP_CHAT_MEMBER_ROLE]: never;
} & {
    [T in ValueOf<typeof CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG>]: OriginalMessagePolicyChangeLog;
} & {
    [T in ValueOf<typeof CONST.REPORT.ACTIONS.TYPE.ROOM_CHANGE_LOG>]: OriginalMessageRoomChangeLog;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type AssertOriginalMessageDefinedForAllActions = AssertTypesEqual<
    ReportActionName,
    keyof OriginalMessageMap,
    `Error: Types don't match, OriginalMessageMap type is missing: ${Exclude<ReportActionName, keyof OriginalMessageMap>}`
>;

type OriginalMessage<T extends ReportActionName> = OriginalMessageMap[T];

export default OriginalMessage;
