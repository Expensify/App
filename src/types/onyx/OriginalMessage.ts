import type {ValueOf} from 'type-fest';
import type CONST from '@src/CONST';
import type DeepValueOf from '@src/types/utils/DeepValueOf';

type PaymentMethodType = DeepValueOf<typeof CONST.IOU.PAYMENT_TYPE | typeof CONST.IOU.REPORT_ACTION_TYPE | typeof CONST.WALLET.TRANSFER_METHOD_TYPE>;

type ActionName = DeepValueOf<typeof CONST.REPORT.ACTIONS.TYPE>;
type OriginalMessageActionName =
    | 'ADDCOMMENT'
    | 'APPROVED'
    | 'CHRONOSOOOLIST'
    | 'CLOSED'
    | 'CREATED'
    | 'HOLD'
    | 'UNHOLD'
    | 'IOU'
    | 'MODIFIEDEXPENSE'
    | 'REIMBURSEMENTQUEUED'
    | 'RENAMED'
    | 'REPORTPREVIEW'
    | 'SUBMITTED'
    | 'TASKCANCELLED'
    | 'TASKCOMPLETED'
    | 'TASKEDITED'
    | 'TASKREOPENED'
    | 'ACTIONABLEJOINREQUEST'
    | 'ACTIONABLEMENTIONWHISPER'
    | 'ACTIONABLETRACKEXPENSEWHISPER'
    | ValueOf<typeof CONST.REPORT.ACTIONS.TYPE.POLICYCHANGELOG>;
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
    actionName: typeof CONST.REPORT.ACTIONS.TYPE.HOLDCOMMENT;
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
    /** Only exists when we are sending money */
    IOUDetails?: IOUDetails;
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
    actionName: typeof CONST.REPORT.ACTIONS.TYPE.ADDCOMMENT;
    originalMessage: {
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
};

type OriginalMessageActionableMentionWhisper = {
    actionName: typeof CONST.REPORT.ACTIONS.TYPE.ACTIONABLEMENTIONWHISPER;
    originalMessage: {
        inviteeAccountIDs: number[];
        inviteeEmails: string;
        lastModified: string;
        reportID: number;
        resolution?: ValueOf<typeof CONST.REPORT.ACTIONABLE_MENTION_WHISPER_RESOLUTION> | null;
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
    actionName: typeof CONST.REPORT.ACTIONS.TYPE.MARKEDREIMBURSED;
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
    actionName: typeof CONST.REPORT.ACTIONS.TYPE.CHRONOSOOOLIST;
    originalMessage: {
        edits: string[];
        events: ChronosOOOEvent[];
        html: string;
        lastModified: string;
    };
};

type OriginalMessageReportPreview = {
    actionName: typeof CONST.REPORT.ACTIONS.TYPE.REPORTPREVIEW;
    originalMessage: {
        linkedReportID: string;
        lastModified?: string;
    };
};

type OriginalMessagePolicyChangeLog = {
    actionName: ValueOf<typeof CONST.REPORT.ACTIONS.TYPE.POLICYCHANGELOG>;
    originalMessage: ChangeLog;
};

type OriginalMessageJoinPolicyChangeLog = {
    actionName: typeof CONST.REPORT.ACTIONS.TYPE.ACTIONABLEJOINREQUEST;
    originalMessage: {
        choice: string;
        email: string;
        inviterEmail: string;
        lastModified: string;
        policyID: string;
    };
};

type OriginalMessageRoomChangeLog = {
    actionName: ValueOf<typeof CONST.REPORT.ACTIONS.TYPE.ROOMCHANGELOG>;
    originalMessage: ChangeLog;
};

type OriginalMessagePolicyTask = {
    actionName:
        | typeof CONST.REPORT.ACTIONS.TYPE.TASKEDITED
        | typeof CONST.REPORT.ACTIONS.TYPE.TASKCANCELLED
        | typeof CONST.REPORT.ACTIONS.TYPE.TASKCOMPLETED
        | typeof CONST.REPORT.ACTIONS.TYPE.TASKREOPENED
        | typeof CONST.REPORT.ACTIONS.TYPE.MODIFIEDEXPENSE;
    originalMessage: unknown;
};

type OriginalMessageModifiedExpense = {
    actionName: typeof CONST.REPORT.ACTIONS.TYPE.MODIFIEDEXPENSE;
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
    };
};

type OriginalMessageReimbursementQueued = {
    actionName: typeof CONST.REPORT.ACTIONS.TYPE.REIMBURSEMENTQUEUED;
    originalMessage: {
        paymentType: DeepValueOf<typeof CONST.IOU.PAYMENT_TYPE>;
    };
};

type OriginalMessageActionableTrackedExpenseWhisper = {
    actionName: typeof CONST.REPORT.ACTIONS.TYPE.ACTIONABLETRACKEXPENSEWHISPER;
    originalMessage: {
        transactionID: string;
        lastModified: string;
        resolution?: ValueOf<typeof CONST.REPORT.ACTIONABLE_TRACK_EXPENSE_WHISPER_RESOLUTION>;
    };
};

type OriginalMessageReimbursementDequeued = {
    actionName: typeof CONST.REPORT.ACTIONS.TYPE.REIMBURSEMENTDEQUEUED;
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

type OriginalMessage =
    | OriginalMessageApproved
    | OriginalMessageIOU
    | OriginalMessageAddComment
    | OriginalMessageActionableMentionWhisper
    | OriginalMessageSubmitted
    | OriginalMessageClosed
    | OriginalMessageCreated
    | OriginalMessageHold
    | OriginalMessageHoldComment
    | OriginalMessageUnHold
    | OriginalMessageRenamed
    | OriginalMessageChronosOOOList
    | OriginalMessageReportPreview
    | OriginalMessageRoomChangeLog
    | OriginalMessagePolicyChangeLog
    | OriginalMessagePolicyTask
    | OriginalMessageJoinPolicyChangeLog
    | OriginalMessageModifiedExpense
    | OriginalMessageReimbursementQueued
    | OriginalMessageReimbursementDequeued
    | OriginalMessageMoved
    | OriginalMessageMarkedReimbursed
    | OriginalMessageActionableTrackedExpenseWhisper;

export default OriginalMessage;
export type {
    ChronosOOOEvent,
    Decision,
    Reaction,
    ActionName,
    IOUMessage,
    ReimbursementDeQueuedMessage,
    Closed,
    OriginalMessageActionName,
    ChangeLog,
    OriginalMessageIOU,
    OriginalMessageCreated,
    OriginalMessageRenamed,
    OriginalMessageAddComment,
    OriginalMessageJoinPolicyChangeLog,
    OriginalMessageActionableMentionWhisper,
    OriginalMessageChronosOOOList,
    OriginalMessageSource,
    OriginalMessageReimbursementDequeued,
    DecisionName,
    PaymentMethodType,
    OriginalMessageActionableTrackedExpenseWhisper,
};
