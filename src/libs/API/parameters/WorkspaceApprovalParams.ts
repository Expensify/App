import type {PolicyEmployee} from '@src/types/onyx';

type CreateWorkspaceApprovalParams = {
    authToken: string;
    policyID: string;
    employees: PolicyEmployee[];
};

type UpdateWorkspaceApprovalParams = CreateWorkspaceApprovalParams;

type RemoveWorkspaceApprovalParams = CreateWorkspaceApprovalParams;

export type {CreateWorkspaceApprovalParams, UpdateWorkspaceApprovalParams, RemoveWorkspaceApprovalParams};
