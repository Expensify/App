import type SubscribeToBlockedConnections from './types';

// Browsers do not let the app pin certificates, so on web nothing is ever reported as blocked.
const subscribeToBlockedConnections: SubscribeToBlockedConnections = () => {};

export default subscribeToBlockedConnections;
