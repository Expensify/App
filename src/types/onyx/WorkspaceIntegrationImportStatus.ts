import type WorkspaceSingleIntegrationImportStatus from "./WorkspaceSingleIntegrationImportStatus";

// The key is the connection name, i.e. quickbooksOnline
type WorkspaceIntegrationImportStatus = Record<string, WorkspaceSingleIntegrationImportStatus>;

export default WorkspaceIntegrationImportStatus;
