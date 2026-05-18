import type {PolicyOwnershipChangeChecks} from '@src/types/onyx';

type RequestWorkspaceOwnerChangeParams = PolicyOwnershipChangeChecks & {
    policyID: string;
};

export default RequestWorkspaceOwnerChangeParams;
