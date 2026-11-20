/** A pending request from a domain-controlled account owner to merge their account into a target account. */
type DomainAccountMergeRequest = {
    /** Backend-assigned ID that keys the Onyx entry. */
    requestID: string;

    requesterAccountID: number;

    sourceAccountID: number;

    targetAccountID: number;

    sourceDomainAccountID: number;

    targetDomainAccountID: number;

    /** ISO timestamp of when the request was created. */
    createdAt: string;
};

export default DomainAccountMergeRequest;
