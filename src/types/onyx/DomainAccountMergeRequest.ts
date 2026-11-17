/** Server-persisted pending domain-controlled account merge request awaiting admin approval. */
type DomainAccountMergeRequest = {
    /** Server-assigned unique identifier for the pending request. */
    requestID: string;

    /** Account that submitted the merge from NewDot. Equal to the target account for the beta flow. */
    requesterAccountID: number;

    /** Account being merged from (ownership proven via validate code). */
    sourceAccountID: number;

    /** Account being merged into. */
    targetAccountID: number;

    /** Domain account of the source side. */
    sourceDomainAccountID: number;

    /** Domain account of the target side. The request record is stored on this NVP. */
    targetDomainAccountID: number;

    /** ISO timestamp of when the request was persisted. */
    createdAt: string;
};

export default DomainAccountMergeRequest;
