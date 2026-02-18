import type Network from '@src/types/onyx/Network';
import type {RequestQueuesInfo} from './RequestsQueuesState';

/**
 * Main global state snapshot interface used for logging context when loading states exceed timeout.
 */
type GlobalStateSnapshot = {
    navigation: NavigationStateInfo;
    session: SessionStateInfo;
    network: NetworkStateInfo;
    requestQueues: RequestQueuesInfo;
};

/**
 * Navigation and routing information
 */
type NavigationStateInfo = {
    /** Current path from navigation state */
    currentPath?: string;
};

/**
 * Session and authentication state.
 */
type SessionStateInfo = {
    /** Whether session is currently loading */
    isSessionLoading: boolean;

    /** Whether authenticating with short-lived token */
    isAuthenticatingWithShortLivedToken: boolean;

    /** Whether authenticating from network store */
    isAuthenticatingFromNetworkStore: boolean;
};

/**
 * Network connectivity and status.
 */
type NetworkStateInfo = Pick<Network, 'networkStatus' | 'timeSkew' | 'shouldForceOffline' | 'shouldSimulatePoorConnection' | 'shouldFailAllRequests'>;

/**
 * Extra loading context for additional debugging information.
 */
type ExtraLoadingContext = Record<string, unknown>;

export type {GlobalStateSnapshot, NavigationStateInfo, SessionStateInfo, NetworkStateInfo, ExtraLoadingContext};
