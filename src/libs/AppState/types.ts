// AppState types for global state snapshot logging
import type {ValueOf} from 'type-fest';
import type CONST from '@src/CONST';
import type {RequestQueuesInfo} from './RequestsQueuesState';

/**
 * Main global state snapshot interface
 * Used for logging context when loading states exceed timeout
 */
type GlobalStateSnapshot = {
    navigation: NavigationStateInfo;
    session: SessionStateInfo;
    network: NetworkStateInfo;
    requestQueues: RequestQueuesInfo;
    extraLoadingContext?: ExtraLoadingContext;
};

/**
 * Navigation and routing information
 */
type NavigationStateInfo = {
    /** Current path from navigation state */
    currentPath?: string;
};

/**
 * Session and authentication state
 */
type SessionStateInfo = {
    /** Whether currently authenticating */
    isAuthenticating: boolean;
};

/**
 * Network connectivity and status
 */
type NetworkStateInfo = {
    /** Network status */
    networkStatus: ValueOf<typeof CONST.NETWORK.NETWORK_STATUS>;

    /** Network time skew */
    timeSkew?: number;

    /** Whether forcing offline mode */
    shouldForceOffline?: boolean;

    /** Whether simulating poor connection */
    shouldSimulatePoorConnection?: boolean;
};

/**
 * Extra loading context for additional debugging information
 */
type ExtraLoadingContext = Record<string, unknown>;

export type {GlobalStateSnapshot, NavigationStateInfo, SessionStateInfo, NetworkStateInfo, ExtraLoadingContext};
