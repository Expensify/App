import * as OnyxCommon from './OnyxCommon';

type UserReactions = {
    /** ID of user reaction */
    id: string;

    /** The skin tone which was used and also the timestamp of when it was added */
    skinTones: Record<number, string>;

    /** Oldest timestamp of when the emoji was added */
    oldestTimestamp: string;
};

type ReportActionReaction = {
    /** The time the emoji was added */
    createdAt: string;

    /** Oldest timestamp of when the emoji was added */
    oldestTimestamp: string;

    /** All the users who have added this emoji */
    users: Record<number, UserReactions>;

    /** Is this action pending? */
    pendingAction?: OnyxCommon.PendingAction;
};

type ReportActionReactions = Record<string, ReportActionReaction>;

export default ReportActionReactions;

export type {UserReactions, ReportActionReaction};
