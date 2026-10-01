/**
 * Helpers shared by the Connections page listing builders.
 */
import type {LocaleContextProps} from '@components/LocaleContextProvider';

import CONST from '@src/CONST';

import type {ConnectionListing, ConnectionsTab} from './types';

const MCP_CONNECTOR = {
    CLAUDE: 'claude',
    CHATGPT: 'chatgpt',
    CURSOR: 'cursor',
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

export {MCP_CONNECTOR, getSyncStatusMessage, getListingsForTab};
