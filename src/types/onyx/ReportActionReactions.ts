type User = {
    /** The skin tone which was used and also the timestamp of when it was added */
    skinTones: Record<string, string>;
};

type ReportActionReaction = {
    /** The time the emoji was added */
    createdAt: string;
    /** All the users who have added this emoji */
    users: Record<number, User>;
};

type ReportActionReactions = Record<string, ReportActionReaction>;

export default ReportActionReactions;
