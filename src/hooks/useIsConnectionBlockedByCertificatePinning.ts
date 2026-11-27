/**
 * Tells components whether certificate pinning blocked our servers on the current network, so they can explain
 * that the network intercepts TLS instead of only saying the user appears to be offline.
 */
import {getCertificatePinningBlockedHost, subscribe} from '@libs/NetworkState';

import {useSyncExternalStore} from 'react';

function getIsConnectionBlockedByCertificatePinning(): boolean {
    return !!getCertificatePinningBlockedHost();
}

export default function useIsConnectionBlockedByCertificatePinning(): boolean {
    return useSyncExternalStore(subscribe, getIsConnectionBlockedByCertificatePinning);
}
