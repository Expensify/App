import type * as OnyxCommon from './OnyxCommon';

/** Model of report user reaction */
type UserReaction = {
    /** ID of user reaction */
    id: string;

    /** The skin tone which was used and also the timestamp of when it was added */
    skinTones: Record<number, string>;

    /** Oldest timestamp of when the emoji was added */
    oldestTimestamp: string;
};

/** Record of report user reactions, indexed by their login name or account id */
type UsersReactions = Record<string, UserReaction>;

/** Model of report action reaction */
type ReportActionReaction = OnyxCommon.OnyxValueWithOfflineFeedback<{
    /** The time the emoji was added */
    createdAt: string;

    /** Oldest timestamp of when the emoji was added */
    oldestTimestamp: string;

    /** All the users who have added this emoji */
    users: UsersReactions;
}>;

/** Record of report action reactions, indexed by emoji name */
type ReportActionReactions = Record<string, ReportActionReaction>;

export default ReportActionReactions;

export type {UsersReactions, ReportActionReaction};
