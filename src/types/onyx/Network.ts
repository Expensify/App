import type {NetworkStatus} from '@libs/NetworkConnection';

/** Model of network state */
type Network = {
    /** Is the network currently offline or not */
    isOffline: boolean;

    /** Should the network be forced offline */
    shouldForceOffline?: boolean;

    /** Whether we should fail all network requests */
    shouldFailAllRequests?: boolean;

    /** Skew between the client and server clocks  */
    timeSkew?: number;

    /** The network's status */
    networkStatus?: NetworkStatus;
};

export default Network;
