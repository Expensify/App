type UpdateMergeFinalApproverParams = {
    /** The ID of the policy to update */
    policyID: string;

    /** Login of the member who will act as the final approver, or null to clear */
    finalApprover: string | null;
};

export default UpdateMergeFinalApproverParams;
