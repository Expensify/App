import type {TupleToUnion, ValueOf} from 'type-fest';
import CONST from '@src/CONST';
import type AssertTypesEqual from '@src/types/utils/AssertTypesEqual';
import type DeepValueOf from '@src/types/utils/DeepValueOf';
import type ReportActionName from './ReportActionName';

type PaymentMethodType = DeepValueOf<typeof CONST.IOU.PAYMENT_TYPE | typeof CONST.IOU.REPORT_ACTION_TYPE | typeof CONST.WALLET.TRANSFER_METHOD_TYPE>;

type OriginalMessageSource = 'Chronos' | 'email' | 'ios' | 'android' | 'web' | '';

type IOUDetails = {
    amount: number;
    comment?: string;
    currency: string;
};

type OriginalMessageIOU = {
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

type OriginalMessageAddComment = {
    html: string;
    text: string;
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
    inviteeAccountIDs: number[];
    inviteeEmails: string;
    lastModified: string;
    reportID: number;
    resolution?: ValueOf<typeof CONST.REPORT.ACTIONABLE_MENTION_WHISPER_RESOLUTION> | null;
    whisperedTo?: number[];
};

type OriginalMessageActionableReportMentionWhisper = {
    reportNames: string[];
    mentionedAccountIDs: number[];
    reportActionID: number;
    reportID: number;
    lastModified: string;
    resolution?: ValueOf<typeof CONST.REPORT.ACTIONABLE_REPORT_MENTION_WHISPER_RESOLUTION> | null;
    whisperedTo?: number[];
};

type OriginalMessageClosed = {
    policyName: string;
    reason: ValueOf<typeof CONST.REPORT.ARCHIVE_REASON>;
    lastModified?: string;
    newAccountID?: number;
    oldAccountID?: number;
};

type OriginalMessageRenamed = {
    html: string;
    lastModified: string;
    oldName: string;
    newName: string;
};

type ChronosOOOTimestamp = {
    date: string;
    timezone: string;
    // eslint-disable-next-line @typescript-eslint/naming-convention
    timezone_type: number;
};

type ChronosOOOEvent = {
    id: string;
    lengthInDays: number;
    summary: string;
    start: ChronosOOOTimestamp;
    end: ChronosOOOTimestamp;
};

type OriginalMessageChronosOOOList = {
    edits: string[];
    events: ChronosOOOEvent[];
    html: string;
    lastModified: string;
};

type OriginalMessageReportPreview = {
    linkedReportID: string;
    lastModified?: string;
    whisperedTo?: number[];
};

type OriginalMessageChangeLog = {
    targetAccountIDs?: number[];
    roomName?: string;
    reportID?: number;
};

type OriginalMessageJoinPolicyChangeLog = {
    choice: string;
    email: string;
    inviterEmail: string;
    lastModified: string;
    policyID: string;
};

type OriginalMessageModifiedExpense = {
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
    movedToReportID?: string;
};

type OriginalMessageReimbursementQueued = {
    paymentType: DeepValueOf<typeof CONST.IOU.PAYMENT_TYPE>;
};

type OriginalMessageActionableTrackedExpenseWhisper = {
    transactionID: string;
    lastModified: string;
    resolution?: ValueOf<typeof CONST.REPORT.ACTIONABLE_TRACK_EXPENSE_WHISPER_RESOLUTION>;
};

type OriginalMessageReimbursementDequeued = {
    cancellationReason: string;
    expenseReportID?: string;
    amount: number;
    currency: string;
};

type OriginalMessageMoved = {
    fromPolicyID: string;
    toPolicyID: string;
    newParentReportID: string;
    movedReportID: string;
};

type OriginalMessageDismissedViolation = {
    reason: string;
    violationName: string;
};

type OriginalMessageMap1 = {
    [CONST.REPORT.ACTIONS.TYPE.ACTIONABLE_JOIN_REQUEST]: {
        originalMessage: OriginalMessageJoinPolicyChangeLog;
    };
    [CONST.REPORT.ACTIONS.TYPE.ACTIONABLE_MENTION_WHISPER]: {
        originalMessage: OriginalMessageActionableMentionWhisper;
    };
    [CONST.REPORT.ACTIONS.TYPE.ACTIONABLE_REPORT_MENTION_WHISPER]: {
        originalMessage: OriginalMessageActionableReportMentionWhisper;
    };
    [CONST.REPORT.ACTIONS.TYPE.ACTIONABLE_TRACK_EXPENSE_WHISPER]: {
        originalMessage: OriginalMessageActionableTrackedExpenseWhisper;
    };
    [CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT]: {
        originalMessage: OriginalMessageAddComment;
    };
    [CONST.REPORT.ACTIONS.TYPE.APPROVED]: {
        originalMessage?: never;
    };
    [CONST.REPORT.ACTIONS.TYPE.CHANGE_FIELD]: {
        originalMessage?: never;
    };
    [CONST.REPORT.ACTIONS.TYPE.CHANGE_POLICY]: {
        originalMessage?: never;
    };
    [CONST.REPORT.ACTIONS.TYPE.CHANGE_TYPE]: {
        originalMessage?: never;
    };
    [CONST.REPORT.ACTIONS.TYPE.CHRONOS_OOO_LIST]: {
        originalMessage: OriginalMessageChronosOOOList;
    };
    [CONST.REPORT.ACTIONS.TYPE.CLOSED]: {
        originalMessage: OriginalMessageClosed;
    };
    [CONST.REPORT.ACTIONS.TYPE.CREATED]: {
        originalMessage?: never;
    };
    [CONST.REPORT.ACTIONS.TYPE.DELEGATE_SUBMIT]: {
        originalMessage?: never;
    };
    [CONST.REPORT.ACTIONS.TYPE.DELETED_ACCOUNT]: {
        originalMessage?: never;
    };
    [CONST.REPORT.ACTIONS.TYPE.DISMISSED_VIOLATION]: {
        originalMessage: OriginalMessageDismissedViolation;
    };
    [CONST.REPORT.ACTIONS.TYPE.DONATION]: {
        originalMessage?: never;
    };
    [CONST.REPORT.ACTIONS.TYPE.EXPORTED_TO_CSV]: {
        originalMessage?: never;
    };
    [CONST.REPORT.ACTIONS.TYPE.EXPORTED_TO_INTEGRATION]: {
        originalMessage?: never;
    };
    [CONST.REPORT.ACTIONS.TYPE.EXPORTED_TO_QUICK_BOOKS]: {
        originalMessage?: never;
    };
    [CONST.REPORT.ACTIONS.TYPE.FORWARDED]: {
        originalMessage?: never;
    };
    [CONST.REPORT.ACTIONS.TYPE.HOLD]: {
        originalMessage?: never;
    };
    [CONST.REPORT.ACTIONS.TYPE.HOLD_COMMENT]: {
        originalMessage?: never;
    };
    [CONST.REPORT.ACTIONS.TYPE.INTEGRATIONS_MESSAGE]: {
        originalMessage?: never;
    };
    [CONST.REPORT.ACTIONS.TYPE.IOU]: {
        originalMessage: OriginalMessageIOU;
    };
    [CONST.REPORT.ACTIONS.TYPE.MANAGER_ATTACH_RECEIPT]: {
        originalMessage?: never;
    };
    [CONST.REPORT.ACTIONS.TYPE.MANAGER_DETACH_RECEIPT]: {
        originalMessage?: never;
    };
    [CONST.REPORT.ACTIONS.TYPE.MARK_REIMBURSED_FROM_INTEGRATION]: {
        originalMessage?: never;
    };
    [CONST.REPORT.ACTIONS.TYPE.MARKED_REIMBURSED]: {
        originalMessage?: never;
    };
    [CONST.REPORT.ACTIONS.TYPE.MERGED_WITH_CASH_TRANSACTION]: {
        originalMessage?: never;
    };
    [CONST.REPORT.ACTIONS.TYPE.MODIFIED_EXPENSE]: {
        originalMessage: OriginalMessageModifiedExpense;
    };
    [CONST.REPORT.ACTIONS.TYPE.MOVED]: {
        originalMessage: OriginalMessageMoved;
    };
    [CONST.REPORT.ACTIONS.TYPE.OUTDATED_BANK_ACCOUNT]: {
        originalMessage?: never;
    };
    [CONST.REPORT.ACTIONS.TYPE.REIMBURSEMENT_ACH_BOUNCE]: {
        originalMessage?: never;
    };
    [CONST.REPORT.ACTIONS.TYPE.REIMBURSEMENT_ACH_CANCELLED]: {
        originalMessage?: never;
    };
    [CONST.REPORT.ACTIONS.TYPE.REIMBURSEMENT_ACCOUNT_CHANGED]: {
        originalMessage?: never;
    };
    [CONST.REPORT.ACTIONS.TYPE.REIMBURSEMENT_DEQUEUED]: {
        originalMessage: OriginalMessageReimbursementDequeued;
    };
    [CONST.REPORT.ACTIONS.TYPE.REIMBURSEMENT_DELAYED]: {
        originalMessage?: never;
    };
    [CONST.REPORT.ACTIONS.TYPE.REIMBURSEMENT_QUEUED]: {
        originalMessage: OriginalMessageReimbursementQueued;
    };
    [CONST.REPORT.ACTIONS.TYPE.REIMBURSEMENT_REQUESTED]: {
        originalMessage?: never;
    };
    [CONST.REPORT.ACTIONS.TYPE.REIMBURSEMENT_SETUP]: {
        originalMessage?: never;
    };
    [CONST.REPORT.ACTIONS.TYPE.RENAMED]: {
        originalMessage: OriginalMessageRenamed;
    };
    [CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW]: {
        originalMessage: OriginalMessageReportPreview;
    };
    [CONST.REPORT.ACTIONS.TYPE.SELECTED_FOR_RANDOM_AUDIT]: {
        originalMessage?: never;
    };
    [CONST.REPORT.ACTIONS.TYPE.SHARE]: {
        originalMessage?: never;
    };
    [CONST.REPORT.ACTIONS.TYPE.STRIPE_PAID]: {
        originalMessage?: never;
    };
    [CONST.REPORT.ACTIONS.TYPE.SUBMITTED]: {
        originalMessage?: never;
    };
    [CONST.REPORT.ACTIONS.TYPE.TASK_CANCELLED]: {
        originalMessage?: never;
    };
    [CONST.REPORT.ACTIONS.TYPE.TASK_COMPLETED]: {
        originalMessage?: never;
    };
    [CONST.REPORT.ACTIONS.TYPE.TASK_EDITED]: {
        originalMessage?: never;
    };
    [CONST.REPORT.ACTIONS.TYPE.TASK_REOPENED]: {
        originalMessage?: never;
    };
    [CONST.REPORT.ACTIONS.TYPE.TAKE_CONTROL]: {
        originalMessage?: never;
    };
    [CONST.REPORT.ACTIONS.TYPE.UNAPPROVED]: {
        originalMessage?: never;
    };
    [CONST.REPORT.ACTIONS.TYPE.UNHOLD]: {
        originalMessage?: never;
    };
    [CONST.REPORT.ACTIONS.TYPE.UNSHARE]: {
        originalMessage?: never;
    };
    [CONST.REPORT.ACTIONS.TYPE.UPDATE_GROUP_CHAT_MEMBER_ROLE]: {
        originalMessage?: never;
    };
    [CONST.REPORT.ACTIONS.TYPE.REIMBURSEMENT_SETUP_REQUESTED]: {
        originalMessage?: never;
    };
} & {
    [T in ValueOf<typeof CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG>]: {
        originalMessage: OriginalMessageChangeLog;
    };
} & {
    [T in ValueOf<typeof CONST.REPORT.ACTIONS.TYPE.ROOM_CHANGE_LOG>]: {
        originalMessage: OriginalMessageChangeLog;
    };
};

type OriginalMessageMap = {
    [CONST.REPORT.ACTIONS.TYPE.ACTIONABLE_JOIN_REQUEST]: OriginalMessageJoinPolicyChangeLog;
    [CONST.REPORT.ACTIONS.TYPE.ACTIONABLE_MENTION_WHISPER]: OriginalMessageActionableMentionWhisper;
    [CONST.REPORT.ACTIONS.TYPE.ACTIONABLE_REPORT_MENTION_WHISPER]: OriginalMessageActionableReportMentionWhisper;
    [CONST.REPORT.ACTIONS.TYPE.ACTIONABLE_TRACK_EXPENSE_WHISPER]: OriginalMessageActionableTrackedExpenseWhisper;
    [CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT]: OriginalMessageAddComment;
    [CONST.REPORT.ACTIONS.TYPE.APPROVED]: never;
    [CONST.REPORT.ACTIONS.TYPE.CHANGE_FIELD]: never;
    [CONST.REPORT.ACTIONS.TYPE.CHANGE_POLICY]: never;
    [CONST.REPORT.ACTIONS.TYPE.CHANGE_TYPE]: never;
    [CONST.REPORT.ACTIONS.TYPE.CHRONOS_OOO_LIST]: OriginalMessageChronosOOOList;
    [CONST.REPORT.ACTIONS.TYPE.CLOSED]: OriginalMessageClosed;
    [CONST.REPORT.ACTIONS.TYPE.CREATED]: never;
    [CONST.REPORT.ACTIONS.TYPE.DELEGATE_SUBMIT]: never;
    [CONST.REPORT.ACTIONS.TYPE.DELETED_ACCOUNT]: never;
    [CONST.REPORT.ACTIONS.TYPE.DISMISSED_VIOLATION]: OriginalMessageDismissedViolation;
    [CONST.REPORT.ACTIONS.TYPE.DONATION]: never;
    [CONST.REPORT.ACTIONS.TYPE.EXPORTED_TO_CSV]: never;
    [CONST.REPORT.ACTIONS.TYPE.EXPORTED_TO_INTEGRATION]: never;
    [CONST.REPORT.ACTIONS.TYPE.EXPORTED_TO_QUICK_BOOKS]: never;
    [CONST.REPORT.ACTIONS.TYPE.FORWARDED]: never;
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
    [CONST.REPORT.ACTIONS.TYPE.SUBMITTED]: never;
    [CONST.REPORT.ACTIONS.TYPE.TASK_CANCELLED]: never;
    [CONST.REPORT.ACTIONS.TYPE.TASK_COMPLETED]: never;
    [CONST.REPORT.ACTIONS.TYPE.TASK_EDITED]: never;
    [CONST.REPORT.ACTIONS.TYPE.TASK_REOPENED]: never;
    [CONST.REPORT.ACTIONS.TYPE.TAKE_CONTROL]: never;
    [CONST.REPORT.ACTIONS.TYPE.UNAPPROVED]: never;
    [CONST.REPORT.ACTIONS.TYPE.UNHOLD]: never;
    [CONST.REPORT.ACTIONS.TYPE.UNSHARE]: never;
    [CONST.REPORT.ACTIONS.TYPE.UPDATE_GROUP_CHAT_MEMBER_ROLE]: never;
    [CONST.REPORT.ACTIONS.TYPE.REIMBURSEMENT_SETUP_REQUESTED]: never;
} & {
    [T in ValueOf<typeof CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG>]: OriginalMessageChangeLog;
} & {
    [T in ValueOf<typeof CONST.REPORT.ACTIONS.TYPE.ROOM_CHANGE_LOG>]: OriginalMessageChangeLog;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type AssertOriginalMessageDefinedForAllActions = AssertTypesEqual<
    ReportActionName,
    keyof OriginalMessageMap,
    `Error: Types don't match, OriginalMessageMap type is missing: ${Exclude<ReportActionName, keyof OriginalMessageMap>}`
>;

type OriginalMessage<T extends ReportActionName> = OriginalMessageMap[T];
type OriginalMessageTemporary<T extends ReportActionName> = OriginalMessageMap1[T];

// Note: type-fest's ConditionalKeys does not work correctly with objects containing `never`: https://github.com/sindresorhus/type-fest/issues/878
type ReportActionNamesWithHTMLMessage = {
    [TKey in keyof OriginalMessageMap]-?: OriginalMessageMap[TKey] extends {html: string} ? (OriginalMessageMap[TKey] extends never ? never : TKey) : never;
}[keyof OriginalMessageMap];
const REPORT_ACTIONS_WITH_HTML_MESSAGE = [CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT, CONST.REPORT.ACTIONS.TYPE.CHRONOS_OOO_LIST, CONST.REPORT.ACTIONS.TYPE.RENAMED] as const;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type AssertAllActionsWithHTMLAreListed = AssertTypesEqual<
    ReportActionNamesWithHTMLMessage,
    TupleToUnion<typeof REPORT_ACTIONS_WITH_HTML_MESSAGE>,
    `Error: Types don't match, REPORT_ACTIONS_WITH_HTML_MESSAGE is missing: ${Exclude<ReportActionNamesWithHTMLMessage, typeof REPORT_ACTIONS_WITH_HTML_MESSAGE>}`
>;

export default OriginalMessage;
export {REPORT_ACTIONS_WITH_HTML_MESSAGE};
export type {
    DecisionName,
    OriginalMessageIOU,
    ChronosOOOEvent,
    PaymentMethodType,
    OriginalMessageSource,
    ReportActionNamesWithHTMLMessage,
    Reaction,
    Decision,
    OriginalMessageChangeLog,
    OriginalMessageTemporary,
};
