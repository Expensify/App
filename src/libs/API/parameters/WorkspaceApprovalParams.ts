type CreateWorkspaceApprovalParams = {
    policyID: string;
    /**
     * Stringified JSON object with type of following structure:
     * Array<{
     *  email: string;
     *  forwardsTo?: string;
     *  submitsTo?: string;
     * }>
     */
    employees: string;

    /** Email of the approver to make the policy's default approver */
    defaultApprover?: string;
};

type UpdateWorkspaceApprovalParams = CreateWorkspaceApprovalParams;

type RemoveWorkspaceApprovalParams = CreateWorkspaceApprovalParams;

export type {CreateWorkspaceApprovalParams, UpdateWorkspaceApprovalParams, RemoveWorkspaceApprovalParams};
