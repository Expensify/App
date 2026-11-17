/** A pending request from a domain-controlled account owner to merge their account into a target account. */
type DomainAccountMergeRequest = {
    /** Backend-assigned ID that keys the Onyx entry. */
    requestID: string;

    /** AccountID of the user who submitted the request. */
    requesterAccountID: number;

    /** AccountID of the source account being merged from. */
    sourceAccountID: number;

    /** AccountID of the target account being merged into. */
    targetAccountID: number;

    /** AccountID of the domain that controls the source account. */
    sourceDomainAccountID: number;

    /** AccountID of the domain that controls the target account. */
    targetDomainAccountID: number;

    /** ISO timestamp of when the request was created. */
    createdAt: string;
};

export default DomainAccountMergeRequest;
