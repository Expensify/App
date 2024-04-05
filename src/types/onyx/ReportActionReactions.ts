import type * as OnyxCommon from './OnyxCommon';

type UserReaction = {
    /** ID of user reaction */
    id: string;

    /** The skin tone which was used and also the timestamp of when it was added */
    skinTones: Record<number, string>;

    /** Oldest timestamp of when the emoji was added */
    oldestTimestamp: string;
};

type UsersReactions = Record<string, UserReaction>;

type ReportActionReaction = OnyxCommon.OnyxValueWithOfflineFeedback<{
    /** The time the emoji was added */
    createdAt: string;

    /** Oldest timestamp of when the emoji was added */
    oldestTimestamp: string;

    /** All the users who have added this emoji */
    users: UsersReactions;
}>;

type ReportActionReactions = Record<string, ReportActionReaction>;

export default ReportActionReactions;

export type {UsersReactions, ReportActionReaction};
