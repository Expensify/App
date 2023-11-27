import {ValueOf} from 'type-fest';
import CONST from '@src/CONST';
import DeepValueOf from '@src/types/utils/DeepValueOf';

type ActionName = DeepValueOf<typeof CONST.REPORT.ACTIONS.TYPE>;
type OriginalMessageActionName =
    | 'ADDCOMMENT'
    | 'APPROVED'
    | 'CHRONOSOOOLIST'
    | 'CLOSED'
    | 'CREATED'
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
    | ValueOf<typeof CONST.REPORT.ACTIONS.TYPE.POLICYCHANGELOG>;
type OriginalMessageApproved = {
    actionName: typeof CONST.REPORT.ACTIONS.TYPE.APPROVED;
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
    amount: number;
    comment?: string;
    currency: string;
    lastModified?: string;
    participantAccountIDs?: number[];
    type: ValueOf<typeof CONST.IOU.REPORT_ACTION_TYPE>;
    paymentType?: DeepValueOf<typeof CONST.IOU.PAYMENT_TYPE>;
    /** Only exists when we are sending money */
    IOUDetails?: IOUDetails;
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
    timestamp: string;
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
};

type OriginalMessageAddComment = {
    actionName: typeof CONST.REPORT.ACTIONS.TYPE.ADDCOMMENT;
    originalMessage: {
        html: string;
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
    originalMessage: unknown;
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

type OriginalMessageRoomChangeLog = {
    actionName: ValueOf<typeof CONST.REPORT.ACTIONS.TYPE.ROOMCHANGELOG>;
    originalMessage: ChangeLog;
};

type OriginalMessagePolicyTask = {
    actionName:
        | typeof CONST.REPORT.ACTIONS.TYPE.TASKEDITED
        | typeof CONST.REPORT.ACTIONS.TYPE.TASKCANCELLED
        | typeof CONST.REPORT.ACTIONS.TYPE.TASKCOMPLETED
        | typeof CONST.REPORT.ACTIONS.TYPE.TASKREOPENED;
    originalMessage: unknown;
};

type OriginalMessageModifiedExpense = {
    actionName: typeof CONST.REPORT.ACTIONS.TYPE.MODIFIEDEXPENSE;
    originalMessage: unknown;
};

type OriginalMessageReimbursementQueued = {
    actionName: typeof CONST.REPORT.ACTIONS.TYPE.REIMBURSEMENTQUEUED;
    originalMessage: unknown;
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
    | OriginalMessageSubmitted
    | OriginalMessageClosed
    | OriginalMessageCreated
    | OriginalMessageRenamed
    | OriginalMessageChronosOOOList
    | OriginalMessageReportPreview
    | OriginalMessageRoomChangeLog
    | OriginalMessagePolicyChangeLog
    | OriginalMessagePolicyTask
    | OriginalMessageModifiedExpense
    | OriginalMessageReimbursementQueued
    | OriginalMessageMoved;

export default OriginalMessage;
export type {ChronosOOOEvent, Decision, Reaction, ActionName, IOUMessage, Closed, OriginalMessageActionName, ChangeLog};
