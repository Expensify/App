type CreateWorkspaceApprovalParams = {
    authToken: string;
    policyID: string;
    employees: string;
};

type UpdateWorkspaceApprovalParams = CreateWorkspaceApprovalParams;

type RemoveWorkspaceApprovalParams = CreateWorkspaceApprovalParams;

export type {CreateWorkspaceApprovalParams, UpdateWorkspaceApprovalParams, RemoveWorkspaceApprovalParams};
