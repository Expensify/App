/** Server-persisted pending domain-controlled account merge request awaiting admin approval. */
type DomainAccountMergeRequest = {
    requestID: string;

    requesterAccountID: number;

    sourceAccountID: number;

    targetAccountID: number;

    sourceDomainAccountID: number;

    targetDomainAccountID: number;

    /** ISO timestamp of when the request was persisted. */
    createdAt: string;
};

export default DomainAccountMergeRequest;
