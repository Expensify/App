/**
 * The last full policy snapshot OpenReport returned for a policy, keyed by policyID.
 *
 * OpenReport sends it back so the server can leave out the members, tags and categories the client already has.
 */
type FullPolicySnapshot = {
    /** The policy lastModified when the snapshot was sent */
    lastModified?: number;
};

export default FullPolicySnapshot;
