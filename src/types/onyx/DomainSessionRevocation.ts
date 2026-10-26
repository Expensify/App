/** Local receipt for a domain-wide revocation, retained through sign-out. */
type DomainSessionRevocation = {
    completionHandle: string;
    status: 'running' | 'succeeded' | 'failed' | 'unavailable';
};

export default DomainSessionRevocation;
