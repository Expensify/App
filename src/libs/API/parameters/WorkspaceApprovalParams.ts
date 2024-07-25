import type {PolicyEmployee} from '@src/types/onyx';

type CreateWorkspaceApprovalParams = {
    authToken: string;
    policyID: string;
    employees: PolicyEmployee[];
};

type UpdateWorkspaceApprovalParams = {
    authToken: string;
    policyID: string;
    employees: PolicyEmployee[];
};

type RemoveWorkspaceApprovalParams = {
    authToken: string;
    policyID: string;
    employees: PolicyEmployee[];
};

export type {CreateWorkspaceApprovalParams, UpdateWorkspaceApprovalParams, RemoveWorkspaceApprovalParams};
