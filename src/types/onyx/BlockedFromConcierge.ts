type BlockedFromConcierge = {
    /** The date that the user will be unblocked */
    expiresAt: string;

    count: 1 | 2 | 3;
};

export default BlockedFromConcierge;
