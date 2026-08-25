import type {ConnectionName} from './Policy';

type ExportAgainModalDescriptionParams = {
    reportName: string;
    connectionName: ConnectionName;
    connectionNameFriendly?: string;
};

type ExportIntegrationSelectedParams = {
    connectionName: ConnectionName;
    connectionNameFriendly?: string;
};

export type {ExportAgainModalDescriptionParams, ExportIntegrationSelectedParams};
