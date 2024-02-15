type WorkspaceSingleIntegrationImportStatus = {
        status: 'starting' | 'finished' | 'progress';
        stagesCompleted: string[];
        stageInProgress: string | null;
        percentage: number;
};

export default WorkspaceSingleIntegrationImportStatus;
