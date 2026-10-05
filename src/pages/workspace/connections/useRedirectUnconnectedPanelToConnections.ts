import Navigation from '@libs/Navigation/Navigation';

import ROUTES from '@src/ROUTES';

import {useEffect, useRef} from 'react';

/**
 * Sends a visit to a connection's settings panel back to the Connections page when that connection isn't set up, so a
 * stale link to a panel still lands somewhere useful. Only the first loaded state is checked, so disconnecting from
 * inside the panel keeps its own navigation.
 */
function useRedirectUnconnectedPanelToConnections(policyID: string | undefined, isDataReady: boolean, isConnected: boolean) {
    const hasCheckedRef = useRef(false);

    useEffect(() => {
        if (hasCheckedRef.current || !policyID || !isDataReady) {
            return;
        }
        hasCheckedRef.current = true;
        if (isConnected) {
            return;
        }
        Navigation.goBack(ROUTES.WORKSPACE_CONNECTIONS.getRoute(policyID));
    }, [policyID, isDataReady, isConnected]);
}

export default useRedirectUnconnectedPanelToConnections;
