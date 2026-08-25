/** Model of persisted network debug settings */
type Network = {
    /** Should the network be forced offline */
    shouldForceOffline?: boolean;

    shouldSimulatePoorConnection?: boolean;

    shouldFailAllRequests?: boolean;

    /** Skew between the client and server clocks  */
    timeSkew?: number;
};

export default Network;
