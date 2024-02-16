type BlockedFromConcierge = {
    /** The date that the user will be unblocked */
    expiresAt: string;

    /** Number of times the user has been blocked. */
    count: 1 | 2 | 3;
};

export default BlockedFromConcierge;
