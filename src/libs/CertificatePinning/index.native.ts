/**
 * Listens for connections that native certificate pinning blocked, so the app can tell the user the network
 * intercepted the connection instead of only reporting that they appear to be offline.
 */
import {CertificatePinningNitroModule} from '@expensify/nitro-utils';

import type SubscribeToBlockedConnections from './types';

const subscribeToBlockedConnections: SubscribeToBlockedConnections = (onConnectionBlocked) => {
    CertificatePinningNitroModule.setConnectionBlockedListener(onConnectionBlocked);
};

export default subscribeToBlockedConnections;
