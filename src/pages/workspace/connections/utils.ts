/**
 * Helpers shared by the Connections page listing builders.
 */
import type {LocaleContextProps} from '@components/LocaleContextProvider';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

import type {ConnectionListing, ConnectionsTab} from './types';

const MCP_CONNECTOR = {
    CLAUDE: 'claude',
    CHATGPT: 'chatgpt',
    CURSOR: 'cursor',
    MCP: 'mcp',
} as const;

type GetSyncStatusMessageParams = {
    /** Shown instead of the last sync time while a sync is running */
    syncingMessage?: string;

    /** ISO datetime of the last successful sync, undefined if the connection never synced */
    successfulDate?: string;

    translate: LocaleContextProps['translate'];

    datetimeToRelative: LocaleContextProps['datetimeToRelative'];
};

function getSyncStatusMessage({syncingMessage, successfulDate, translate, datetimeToRelative}: GetSyncStatusMessageParams): string {
    if (syncingMessage) {
        return syncingMessage;
    }
    if (!successfulDate) {
        return translate('workspace.accounting.notSync');
    }
    return translate('workspace.accounting.lastSync', datetimeToRelative(successfulDate));
}

function getListingsForTab(listings: ConnectionListing[], tab: ConnectionsTab): ConnectionListing[] {
    if (tab === CONST.TAB.CONNECTIONS.ALL) {
        return listings;
    }
    return listings.filter((listing) => listing.category === tab);
}

/** The page listing the workspace's accounting integrations, which is Connections while the unified Connections beta is on */
function getAccountingConnectionsRoute(isUnifiedConnectionsBetaEnabled: boolean, ...params: Parameters<typeof ROUTES.POLICY_ACCOUNTING.getRoute>) {
    if (isUnifiedConnectionsBetaEnabled) {
        return ROUTES.WORKSPACE_CONNECTIONS.getRoute(...params);
    }
    return ROUTES.POLICY_ACCOUNTING.getRoute(...params);
}

/** The page an accounting integration's settings open from, which is the Connections accounting panel while the unified Connections beta is on */
function getAccountingSettingsRoute(isUnifiedConnectionsBetaEnabled: boolean, policyID: string) {
    if (isUnifiedConnectionsBetaEnabled) {
        return ROUTES.WORKSPACE_CONNECTIONS_ACCOUNTING.getRoute(policyID);
    }
    return ROUTES.POLICY_ACCOUNTING.getRoute(policyID);
}

export {MCP_CONNECTOR, getSyncStatusMessage, getListingsForTab, getAccountingConnectionsRoute, getAccountingSettingsRoute};
