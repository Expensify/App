type Network = {
    /** Is the network currently offline or not */
    isOffline: boolean;

    /** Should the network be forced offline */
    shouldForceOffline?: boolean;

    /** Whether we should fail all network requests */
    shouldFailAllRequests?: boolean;

    /** Skew between the client and server clocks  */
    timeSkew?: number;
};

export default Network;
