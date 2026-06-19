/** Model of persisted network debug settings */
type Network = {
    /** Should the network be forced offline */
    shouldForceOffline?: boolean;

    /** Whether we should simulate poor connection */
    shouldSimulatePoorConnection?: boolean;

    /** Whether we should fail all network requests */
    shouldFailAllRequests?: boolean;

    /** Skew between the client and server clocks  */
    timeSkew?: number;
};

export default Network;
