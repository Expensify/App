type CreateWorkspaceApprovalParams = {
    authToken: string;
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
};

type UpdateWorkspaceApprovalParams = CreateWorkspaceApprovalParams;

type RemoveWorkspaceApprovalParams = CreateWorkspaceApprovalParams;

export type {CreateWorkspaceApprovalParams, UpdateWorkspaceApprovalParams, RemoveWorkspaceApprovalParams};
