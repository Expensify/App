/** Marks a Concierge report action whose followup list is still pending arrival from the server */
type ConciergePendingFollowupList = {
    /** The reportActionID of the optimistic Concierge action awaiting its followup list */
    reportActionID: string;

    /** Timestamp (ms) when the pending flag was created, used for TTL cleanup */
    createdAt: number;
};

export default ConciergePendingFollowupList;
