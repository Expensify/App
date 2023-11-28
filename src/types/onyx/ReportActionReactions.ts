import * as OnyxCommon from './OnyxCommon';

type UserReactions = {
    id: string;

    /** The skin tone which was used and also the timestamp of when it was added */
    skinTones: Record<number, string>;

    oldestTimestamp: string;
};

type ReportActionReaction = {
    /** The time the emoji was added */
    createdAt: string;

    oldestTimestamp: string;

    /** All the users who have added this emoji */
    users: Record<number, UserReactions>;

    pendingAction?: OnyxCommon.PendingAction;
};

type ReportActionReactions = Record<string, ReportActionReaction>;

export default ReportActionReactions;

export type {UserReactions, ReportActionReaction};
