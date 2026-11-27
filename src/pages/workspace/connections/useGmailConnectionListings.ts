/**
 * Builds the Gmail listing in the Receipts category of the Connections page. Gmail is connected per user, so the card
 * shows the current user's own Gmail accounts on every workspace they open.
 */
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';

import Navigation from '@libs/Navigation/Navigation';
import {getGmailConnections, getLastSearchedDatetime} from '@libs/OAuthConnectionUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Policy} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import type {ConnectionListing} from './types';

function useGmailConnectionListings(policy: OnyxEntry<Policy>): ConnectionListing[] {
    const policyID = policy?.id;
    const {translate, datetimeToRelative} = useLocalize();
    const {isBetaEnabled} = usePermissions();
    const icons = useMemoizedLazyExpensifyIcons(['GmailSquare']);
    const [oauthConnections] = useOnyx(ONYXKEYS.NVP_PRIVATE_OAUTH_CONNECTIONS);

    if (!policyID || !isBetaEnabled(CONST.BETAS.RECEIPT_SYNC)) {
        return [];
    }

    const connections = getGmailConnections(oauthConnections);
    const isBroken = connections.some((connection) => !!connection.error);
    const lastSearchedAt = Math.max(0, ...connections.map((connection) => connection.lastSearchedAt ?? 0));
    const lastSearchedDatetime = getLastSearchedDatetime(lastSearchedAt);

    let statusMessage = translate('workspace.connections.gmail.notSyncedYet');
    if (isBroken) {
        statusMessage = translate('workspace.connections.brokenConnection');
    } else if (lastSearchedDatetime) {
        statusMessage = translate('workspace.connections.gmail.synced', datetimeToRelative(lastSearchedDatetime));
    }

    return [
        {
            key: CONST.OAUTH_CONNECTIONS.PROVIDER.GMAIL,
            category: CONST.TAB.CONNECTIONS.RECEIPTS,
            title: translate('workspace.connections.gmail.title'),
            icon: icons.GmailSquare,
            status: connections.length ? {isBroken, message: statusMessage} : undefined,
            onConfigure: () => Navigation.navigate(ROUTES.WORKSPACE_CONNECTIONS_GMAIL.getRoute(policyID)),
        },
    ];
}

export default useGmailConnectionListings;
