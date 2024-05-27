type WorkspaceDetails = {
    policyID: string | undefined;
    name: string;
};

/**
 * Sort the workspaces by their name, while keeping the selected one at the beginning.
 * @param workspace1 Details of the first workspace to be compared.
 * @param workspace2 Details of the second workspace to be compared.
 * @param selectedWorkspaceID ID of the selected workspace which needs to be at the beginning.
 */
const sortWorkspacesBySelected = (workspace1: WorkspaceDetails, workspace2: WorkspaceDetails, selectedWorkspaceID: string | undefined): number => {
    if (workspace1.policyID === selectedWorkspaceID) {
        return -1;
    }
    if (workspace2.policyID === selectedWorkspaceID) {
        return 1;
    }
    return workspace1.name?.toLowerCase().localeCompare(workspace2.name?.toLowerCase() ?? '') ?? 0;
};

export default sortWorkspacesBySelected;
