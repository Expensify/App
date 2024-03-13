type WorkspaceIntegrationImportStatus = {
    status: 'starting' | 'finished' | 'progress';
    stageInProgress: string | null;
    connectionName: 'quickbooksOnline'
};

export default WorkspaceIntegrationImportStatus;
