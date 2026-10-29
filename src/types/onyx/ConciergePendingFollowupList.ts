/** Marks a Concierge report action whose followup list is still pending arrival from the server */
type ConciergePendingFollowupList = {
    /** The reportActionID of the optimistic Concierge action awaiting its followup list */
    reportActionID: string;

    /** Timestamp (ms) when the pending flag was created, used for TTL cleanup */
    createdAt: number;

    /** Whether the skeleton should be visually hidden (e.g., user is offline) */
    hidden?: boolean;
};

export default ConciergePendingFollowupList;
