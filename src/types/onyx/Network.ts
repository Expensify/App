/** Model of network state */
type Network = {
    /** Is the network currently offline or not */
    isOffline: boolean;

    /** Should the network be forced offline */
    shouldForceOffline?: boolean;

    /** Whether we should simulate poor connection */
    shouldSimulatePoorConnection?: boolean;

    /** Whether we should fail all network requests */
    shouldFailAllRequests?: boolean;

    /** Skew between the client and server clocks  */
    timeSkew?: number;

    /** The time when network change from online to offline */
    lastOfflineAt?: string;

    /** The reason the network is in hard stop, if any */
    hardStopReason?: string;
};

export default Network;
