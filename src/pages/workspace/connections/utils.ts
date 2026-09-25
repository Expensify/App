/**
 * Helpers shared by the Connections page listing builders.
 */
import type {LocaleContextProps} from '@components/LocaleContextProvider';

import CONST from '@src/CONST';
import type {MergeHRProviderSlug} from '@src/CONST/MERGE_HR_PROVIDERS';

import type {ConnectionListing, ConnectionsTab} from './types';

const MCP_CONNECTOR = {
    CLAUDE: 'claude',
    CHATGPT: 'chatgpt',
    CURSOR: 'cursor',
} as const;

/** Matches the key `getHRCards` gives each Merge HR provider */
function getMergeHRListingKey(slug: MergeHRProviderSlug) {
    return `merge_${slug}`;
}

/** Listing keys shown on the Popular tab, in display order */
const POPULAR_LISTING_KEYS: string[] = [
    CONST.POLICY.CONNECTIONS.NAME.QBO,
    CONST.POLICY.CONNECTIONS.NAME.XERO,
    CONST.POLICY.CONNECTIONS.NAME.NETSUITE,
    CONST.POLICY.RECEIPT_PARTNERS.NAME.UBER,
    MCP_CONNECTOR.CLAUDE,
    MCP_CONNECTOR.CHATGPT,
    CONST.POLICY.CONNECTIONS.NAME.GUSTO,
    getMergeHRListingKey('bamboohr'),
];

type GetSyncStatusMessageParams = {
    /** Shown instead of the last sync time while a sync is running */
    syncingMessage?: string;

    /** ISO datetime of the last successful sync, undefined if the connection never synced */
    successfulDate?: string;

    translate: LocaleContextProps['translate'];

    datetimeToCalendarTime: LocaleContextProps['datetimeToCalendarTime'];
};

function getSyncStatusMessage({syncingMessage, successfulDate, translate, datetimeToCalendarTime}: GetSyncStatusMessageParams): string {
    if (syncingMessage) {
        return syncingMessage;
    }
    if (!successfulDate) {
        return translate('workspace.accounting.notSync');
    }
    return translate('workspace.connections.synced', datetimeToCalendarTime(successfulDate, false, true));
}

function getListingsForTab(listings: ConnectionListing[], tab: ConnectionsTab): ConnectionListing[] {
    if (tab === CONST.TAB.CONNECTIONS.ALL) {
        return listings;
    }
    if (tab === CONST.TAB.CONNECTIONS.POPULAR) {
        return POPULAR_LISTING_KEYS.map((key) => listings.find((listing) => listing.key === key)).filter((listing): listing is ConnectionListing => !!listing);
    }
    return listings.filter((listing) => listing.category === tab);
}

export {MCP_CONNECTOR, getSyncStatusMessage, getListingsForTab};
