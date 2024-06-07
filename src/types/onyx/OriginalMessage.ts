import type {ValueOf} from 'type-fest';
import type CONST from '@src/CONST';
import type DeepValueOf from '@src/types/utils/DeepValueOf';

/** Types of join workspace resolutions */
type JoinWorkspaceResolution = ValueOf<typeof CONST.REPORT.ACTIONABLE_MENTION_JOIN_WORKSPACE_RESOLUTION>;

/** Types of payments methods */
type PaymentMethodType = DeepValueOf<typeof CONST.IOU.PAYMENT_TYPE | typeof CONST.IOU.REPORT_ACTION_TYPE | typeof CONST.WALLET.TRANSFER_METHOD_TYPE>;

/** Names of report actions */
type ActionName = DeepValueOf<typeof CONST.REPORT.ACTIONS.TYPE>;

/** Names of task report actions */
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
    | 'ACTIONABLEREPORTMENTIONWHISPER'
    | 'ACTIONABLETRACKEXPENSEWHISPER'
    | 'TRIPPREVIEW'
    | ValueOf<typeof CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG>;

/** Model of `approved` report action */
type OriginalMessageApproved = {
    /** Approved */
    actionName: typeof CONST.REPORT.ACTIONS.TYPE.APPROVED;

    /** Content of the original message */
    originalMessage: {
        /** Approved expense amount */
        amount: number;

        /** Currency of the approved expense amount */
        currency: string;

        /** Report ID of the expense */
        expenseReportID: string;
    };
};

/** Types of sources of original message */
type OriginalMessageSource = 'Chronos' | 'email' | 'ios' | 'android' | 'web' | '';

/** Model of `hold` report action */
type OriginalMessageHold = {
    /** Hold */
    actionName: typeof CONST.REPORT.ACTIONS.TYPE.HOLD;

    /** Content of the original message */
    originalMessage: unknown;
};

/** Model of `hold comment` report action */
type OriginalMessageHoldComment = {
    /** Hold comment */
    actionName: typeof CONST.REPORT.ACTIONS.TYPE.HOLD_COMMENT;

    /** Content of the original message */
    originalMessage: unknown;
};

/** Model of `unhold` report action */
type OriginalMessageUnHold = {
    /** Unhold */
    actionName: typeof CONST.REPORT.ACTIONS.TYPE.UNHOLD;

    /** Content of the original message */
    originalMessage: unknown;
};

/** Details provided when sending money */
type IOUDetails = {
    /** How much was sent */
    amount: number;

    /** Optional comment */
    comment?: string;

    /** Currency of the money sent */
    currency: string;
};

/** Model of original message of `IOU` report action */
type IOUMessage = {
    /** The ID of the `IOU` transaction */
    IOUTransactionID?: string;

    /** ID of the `IOU` report */
    IOUReportID?: string;

    /** ID of the expense report */
    expenseReportID?: string;

    /** How much was transactioned */
    amount: number;

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

/** Model of original message of `reimbursed dequeued` report action */
type ReimbursementDeQueuedMessage = {
    /** Why the reimbursement was cancelled */
    cancellationReason: ValueOf<typeof CONST.REPORT.CANCEL_PAYMENT_REASONS>;

    /** ID of the `expense` report */
    expenseReportID?: string;

    /** Amount that wasn't reimbursed */
    amount: number;

    /** Currency of the money that wasn't reimbursed */
    currency: string;
};

/** Model of `IOU` report action */
type OriginalMessageIOU = {
    /** IOU */
    actionName: typeof CONST.REPORT.ACTIONS.TYPE.IOU;

    /** Content of the original message */
    originalMessage: IOUMessage;
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

    /** When was the decision name */
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

/** Model of original message of `closed` report action */
type Closed = {
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
};

/** Model of `add comment` report action */
type OriginalMessageAddComment = {
    /** Add comment */
    actionName: typeof CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT;

    /** Content of the original message */
    originalMessage: {
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
    };
};

/** Model of `actionable mention whisper` report action */
type OriginalMessageActionableMentionWhisper = {
    /** Actionable mention whisper */
    actionName: typeof CONST.REPORT.ACTIONS.TYPE.ACTIONABLE_MENTION_WHISPER;

    /** Content of the original message */
    originalMessage: {
        /** Account IDs of users that aren't members of the room  */
        inviteeAccountIDs: number[];

        /** Decision on whether to invite users that were mentioned but aren't members or do nothing */
        resolution?: ValueOf<typeof CONST.REPORT.ACTIONABLE_MENTION_WHISPER_RESOLUTION> | null;

        /** Collection of accountIDs of users mentioned in message */
        whisperedTo?: number[];
    };
};

/** Model of `actionable report mention whisper` report action */
type OriginalMessageActionableReportMentionWhisper = {
    /** Actionable report mention whisper */
    actionName: typeof CONST.REPORT.ACTIONS.TYPE.ACTIONABLE_REPORT_MENTION_WHISPER;

    /** Content of the original message */
    originalMessage: {
        /** Decision on whether to create a report that were mentioned but doesn't exist or do nothing */
        resolution?: ValueOf<typeof CONST.REPORT.ACTIONABLE_REPORT_MENTION_WHISPER_RESOLUTION> | null;

        /** Collection of accountIDs of users mentioned in message */
        whisperedTo?: number[];
    };
};

/** Model of `submitted` report action */
type OriginalMessageSubmitted = {
    /** Submitted */
    actionName: typeof CONST.REPORT.ACTIONS.TYPE.SUBMITTED;

    /** Content of the original message */
    originalMessage: {
        /** Approved expense amount */
        amount: number;

        /** Currency of the approved expense amount */
        currency: string;

        /** Report ID of the expense */
        expenseReportID: string;
    };
};

/** Model of `closed` report action */
type OriginalMessageClosed = {
    /** Closed */
    actionName: typeof CONST.REPORT.ACTIONS.TYPE.CLOSED;

    /** Content of the original message */
    originalMessage: Closed;
};

/** Model of `created` report action */
type OriginalMessageCreated = {
    /** Created */
    actionName: typeof CONST.REPORT.ACTIONS.TYPE.CREATED;

    /** Content of the original message */
    originalMessage?: unknown;
};

/** Model of `marked reimbursed` report action */
type OriginalMessageMarkedReimbursed = {
    /** Marked reimbursed */
    actionName: typeof CONST.REPORT.ACTIONS.TYPE.MARKED_REIMBURSED;

    /** Content of the original message */
    originalMessage?: unknown;
};

/** Model of `renamed` report action, created when chat rooms get renamed */
type OriginalMessageRenamed = {
    /** Renamed */
    actionName: typeof CONST.REPORT.ACTIONS.TYPE.RENAMED;

    /** Content of the original message */
    originalMessage: {
        /** Renamed room comment */
        html: string;

        /** When was report action last modified */
        lastModified: string;

        /** Old room name */
        oldName: string;

        /** New room name */
        newName: string;
    };
};

/** Model of Chronos OOO Timestamp */
type ChronosOOOTimestamp = {
    /** Date timestamp */
    date: string;
};

/** Model of change log */
type ChangeLog = {
    /** Account IDs of users that either got invited or removed from the room */
    targetAccountIDs?: number[];

    /** Name of the chat room */
    roomName?: string;

    /** ID of the report */
    reportID?: number;
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

/** Model of modified expense */
type ModifiedExpense = {
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

    /** Collection of accountIDs of users mentioned in expense report */
    whisperedTo?: number[];
};

/** Model of `Chronos OOO List` report action */
type OriginalMessageChronosOOOList = {
    /** Chronos OOO list */
    actionName: typeof CONST.REPORT.ACTIONS.TYPE.CHRONOS_OOO_LIST;

    /** Content of the original message */
    originalMessage: {
        /** Collection of OOO events to show in report action */
        events: ChronosOOOEvent[];
    };
};

/** Model of `report preview` report action */
type OriginalMessageReportPreview = {
    /** Report preview */
    actionName: typeof CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW;

    /** Content of the original message */
    originalMessage: {
        /** ID of the report to be previewed */
        linkedReportID: string;

        /** Collection of accountIDs of users mentioned in report */
        whisperedTo?: number[];
    };
};

/** Model of `policy change log` report action */
type OriginalMessagePolicyChangeLog = {
    /** Policy change log  */
    actionName: ValueOf<typeof CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG>;

    /** Content of the original message */
    originalMessage: ChangeLog;
};

/** Model of `join policy changelog` report action */
type OriginalMessageJoinPolicyChangeLog = {
    /** Actionable join request */
    actionName: typeof CONST.REPORT.ACTIONS.TYPE.ACTIONABLE_JOIN_REQUEST;

    /** Content of the original message */
    originalMessage: {
        /** What was the invited user decision */
        choice: JoinWorkspaceResolution;

        /** ID of the affected policy */
        policyID: string;
    };
};

/** Model of `room change log` report action */
type OriginalMessageRoomChangeLog = {
    /** Room change log */
    actionName: ValueOf<typeof CONST.REPORT.ACTIONS.TYPE.ROOM_CHANGE_LOG>;

    /** Content of the original message */
    originalMessage: ChangeLog;
};

/** Model of `policy task` report action */
type OriginalMessagePolicyTask = {
    /** Policy task */
    actionName:
        | typeof CONST.REPORT.ACTIONS.TYPE.TASK_EDITED
        | typeof CONST.REPORT.ACTIONS.TYPE.TASK_CANCELLED
        | typeof CONST.REPORT.ACTIONS.TYPE.TASK_COMPLETED
        | typeof CONST.REPORT.ACTIONS.TYPE.TASK_REOPENED
        | typeof CONST.REPORT.ACTIONS.TYPE.MODIFIED_EXPENSE;

    /** Content of the original message */
    originalMessage: unknown;
};

/** Model of `modified expense` report action */
type OriginalMessageModifiedExpense = {
    /** Modified expense */
    actionName: typeof CONST.REPORT.ACTIONS.TYPE.MODIFIED_EXPENSE;

    /** Content of the original message */
    originalMessage: ModifiedExpense;
};

/** Model of `reimbursement queued` report action */
type OriginalMessageReimbursementQueued = {
    /** Reimbursement queued */
    actionName: typeof CONST.REPORT.ACTIONS.TYPE.REIMBURSEMENT_QUEUED;

    /** Content of the original message */
    originalMessage: {
        /** How is the payment getting reimbursed */
        paymentType: DeepValueOf<typeof CONST.IOU.PAYMENT_TYPE>;
    };
};

/** Model of `actionable tracked expense whisper` report action */
type OriginalMessageActionableTrackedExpenseWhisper = {
    /** Actionable track expense whisper */
    actionName: typeof CONST.REPORT.ACTIONS.TYPE.ACTIONABLE_TRACK_EXPENSE_WHISPER;

    /** Content of the original message */
    originalMessage: {
        /** ID of the transaction */
        transactionID: string;

        /** When was the tracked expense whisper last modified */
        lastModified: string;

        /** What was the decision of the user */
        resolution?: ValueOf<typeof CONST.REPORT.ACTIONABLE_TRACK_EXPENSE_WHISPER_RESOLUTION>;
    };
};

/** Model of `reimbursement dequeued` report action */
type OriginalMessageReimbursementDequeued = {
    /** Reimbursement dequeued */
    actionName: typeof CONST.REPORT.ACTIONS.TYPE.REIMBURSEMENT_DEQUEUED;

    /** Content of the original message */
    originalMessage: ReimbursementDeQueuedMessage;
};

/** Model of `moved` report action */
type OriginalMessageMoved = {
    /** Moved */
    actionName: typeof CONST.REPORT.ACTIONS.TYPE.MOVED;

    /** Content of the original message */
    originalMessage: {
        /** ID of the old policy */
        fromPolicyID: string;

        /** ID of the new policy */
        toPolicyID: string;

        /** ID of the new parent report */
        newParentReportID: string;

        /** ID of the moved report */
        movedReportID: string;
    };
};

/** Model of `merged with cash transaction` report action */
type OriginalMessageMergedWithCashTransaction = {
    /** Merged with cash transaction */
    actionName: typeof CONST.REPORT.ACTIONS.TYPE.MERGED_WITH_CASH_TRANSACTION;

    /** Content of the original message */
    originalMessage: Record<string, never>; // No data is sent with this action
};

/** Model of `dismissed violation` report action */
type OriginalMessageDismissedViolation = {
    /** Dismissed violation */
    actionName: typeof CONST.REPORT.ACTIONS.TYPE.DISMISSED_VIOLATION;

    /** Content of the original message */
    originalMessage: {
        /** Why the violation was dismissed */
        reason: string;

        /** Name of the violation */
        violationName: string;
    };
};

/** Model of `trip room preview` report action */
type OriginalMessageTripRoomPreview = {
    /** Trip Room Preview */
    actionName: typeof CONST.REPORT.ACTIONS.TYPE.TRIPPREVIEW;

    /** Content of the original message */
    originalMessage: {
        /** ID of the report to be previewed */
        linkedReportID: string;

        /** When was report action last modified */
        lastModified?: string;

        /** Collection of accountIDs of users mentioned in report */
        whisperedTo?: number[];
    };
};

/** Model of report action */
type OriginalMessage =
    | OriginalMessageApproved
    | OriginalMessageIOU
    | OriginalMessageAddComment
    | OriginalMessageActionableMentionWhisper
    | OriginalMessageActionableReportMentionWhisper
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
    | OriginalMessageTripRoomPreview
    | OriginalMessageActionableTrackedExpenseWhisper
    | OriginalMessageMergedWithCashTransaction
    | OriginalMessageDismissedViolation;

export default OriginalMessage;
export type {
    JoinWorkspaceResolution,
    ChronosOOOEvent,
    Decision,
    Reaction,
    ActionName,
    IOUMessage,
    ReimbursementDeQueuedMessage,
    Closed,
    OriginalMessageActionName,
    ChangeLog,
    ModifiedExpense,
    OriginalMessageApproved,
    OriginalMessageSubmitted,
    OriginalMessageIOU,
    OriginalMessageCreated,
    OriginalMessageRenamed,
    OriginalMessageAddComment,
    OriginalMessageJoinPolicyChangeLog,
    OriginalMessageActionableMentionWhisper,
    OriginalMessageActionableReportMentionWhisper,
    OriginalMessageReportPreview,
    OriginalMessageModifiedExpense,
    OriginalMessageChronosOOOList,
    OriginalMessageRoomChangeLog,
    OriginalMessageSource,
    OriginalMessageReimbursementDequeued,
    DecisionName,
    PaymentMethodType,
    OriginalMessageActionableTrackedExpenseWhisper,
    OriginalMessageDismissedViolation,
};
