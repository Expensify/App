type UpdateMergeATSApproverFieldParams = {
    /** The ID of the policy to update. */
    policyID: string;

    /** The ATS field whose value identifies the default approver for a candidate, or null to clear. */
    approverField: string | null;
};

export default UpdateMergeATSApproverFieldParams;
