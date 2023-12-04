type Network = {
    /** Is the network currently offline or not */
    isOffline?: boolean;

    /** Should the network be forced offline */
    shouldForceOffline?: boolean;

    /** Whether we should fail all network requests */
    shouldFailAllRequests?: boolean;
};

export default Network;
