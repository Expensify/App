// The key is the connection name, i.e. quickbooksOnline
type WorkspaceIntegrationImportStatus = Record<string, {
        status: 'starting' | 'finished' | 'progress';
        stagesCompleted: string[];
        stageInProgress: string | null;
        percentage: number;
}>;

export default WorkspaceIntegrationImportStatus;
