import type {BlockedConnection} from '@expensify/nitro-utils';

type SubscribeToBlockedConnections = (onConnectionBlocked: (connection: BlockedConnection) => void) => void;

export default SubscribeToBlockedConnections;
