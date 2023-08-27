// TODO: Remove this after CONST.ts is migrated to TS
/* eslint-disable @typescript-eslint/no-duplicate-type-constituents */
import {ValueOf} from 'type-fest';
import CONST from '../../CONST';

type OriginalMessageIOU = {
    actionName: typeof CONST.REPORT.ACTIONS.TYPE.IOU;
    originalMessage: {
        /** The ID of the iou transaction */
        IOUTransactionID?: string;

        IOUReportID?: number;
        amount: number;
        comment?: string;
        currency: string;
        lastModified?: string;
        participantAccountIDs?: number[];
        participants?: string[];
        type: string;
    };
};

type FlagSeverityName = 'spam' | 'inconsiderate' | 'bullying' | 'intimidation' | 'harassment' | 'assault';
type FlagSeverity = {
    accountID: number;
    timestamp: string;
};

type Decision = {
    decision: string;
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

type OriginalMessageClosed = {
    actionName: typeof CONST.REPORT.ACTIONS.TYPE.CLOSED;
    originalMessage: {
        policyName: string;
        reason: 'default' | 'accountClosed' | 'accountMerged' | 'removedPolicy' | 'policyDeleted';
        lastModified?: string;
    };
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
    };
};

type OriginalMessagePolicyChangeLog = {
    actionName: ValueOf<typeof CONST.REPORT.ACTIONS.TYPE.POLICYCHANGELOG>;
    originalMessage: unknown;
};

type OriginalMessagePolicyTask = {
    actionName:
        | typeof CONST.REPORT.ACTIONS.TYPE.TASKEDITED
        | typeof CONST.REPORT.ACTIONS.TYPE.TASKCANCELLED
        | typeof CONST.REPORT.ACTIONS.TYPE.TASKCOMPLETED
        | typeof CONST.REPORT.ACTIONS.TYPE.TASKREOPENED;
    originalMessage: unknown;
};

type OriginalMessage =
    | OriginalMessageIOU
    | OriginalMessageAddComment
    | OriginalMessageClosed
    | OriginalMessageCreated
    | OriginalMessageRenamed
    | OriginalMessageChronosOOOList
    | OriginalMessageReportPreview
    | OriginalMessagePolicyChangeLog
    | OriginalMessagePolicyTask;

export default OriginalMessage;
export type {Reaction};
