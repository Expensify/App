import {getPathFromState} from '@react-navigation/native';
import type {OnyxEntry} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import Log from '@libs/Log';
import {linkingConfig} from '@libs/Navigation/linkingConfig';
import {navigationRef} from '@libs/Navigation/Navigation';
import {isAuthenticating as isAuthenticatingNetworkStore} from '@libs/Network/NetworkStore';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Network, Session} from '@src/types/onyx';
import captureRequestsQueueState from './RequestsQueuesState';
import type {ExtraLoadingContext, GlobalStateSnapshot, NavigationStateInfo, NetworkStateInfo, SessionStateInfo} from './types';

let currentSession: OnyxEntry<Session>;
let currentNetwork: OnyxEntry<Network>;

// We have opted for connectWithoutView here as this is strictly non-UI and only for logging.
Onyx.connectWithoutView({
    key: ONYXKEYS.SESSION,
    callback: (value) => {
        currentSession = value;
    },
});

// We have opted for connectWithoutView here as this is strictly non-UI and only for logging.
Onyx.connectWithoutView({
    key: ONYXKEYS.NETWORK,
    callback: (value) => {
        currentNetwork = value;
    },
});

/**
 * Captures current navigation state.
 */
function captureNavigationState(): NavigationStateInfo {
    try {
        const currentRoute = navigationRef.current?.getCurrentRoute();
        if (!currentRoute?.name) {
            return {currentPath: undefined};
        }

        const routeFromState = getPathFromState(navigationRef.getRootState(), linkingConfig.config);
        return {
            currentPath: routeFromState || undefined,
        };
    } catch (error) {
        return {currentPath: undefined};
    }
}

/**
 * Captures current session authentication state.
 */
function captureSessionState(): SessionStateInfo {
    // Check multiple authentication states to get complete picture
    const isSessionLoading = !!currentSession?.loading;
    const isAuthenticatingWithShortLivedToken = !!currentSession?.isAuthenticatingWithShortLivedToken;
    const isAuthenticatingFromNetworkStore = isAuthenticatingNetworkStore();

    return {
        isSessionLoading,
        isAuthenticatingWithShortLivedToken,
        isAuthenticatingFromNetworkStore,
    };
}

/**
 * Captures current network connectivity state.
 */
function captureNetworkState(): NetworkStateInfo {
    return {
        networkStatus: (currentNetwork?.networkStatus ?? CONST.NETWORK.NETWORK_STATUS.UNKNOWN) as ValueOf<typeof CONST.NETWORK.NETWORK_STATUS>,
        timeSkew: currentNetwork?.timeSkew,
        shouldForceOffline: currentNetwork?.shouldForceOffline,
        shouldSimulatePoorConnection: currentNetwork?.shouldSimulatePoorConnection,
        shouldFailAllRequests: currentNetwork?.shouldFailAllRequests,
    };
}

/**
 * Captures current global state of the app including navigation, session, network, and request queues.
 */
function captureAppState(): GlobalStateSnapshot {
    return {
        navigation: captureNavigationState(),
        session: captureSessionState(),
        network: captureNetworkState(),
        requestQueues: captureRequestsQueueState(),
    };
}

function logAppStateOnLongLoading(extraLoadingContext?: ExtraLoadingContext, timeout?: number): void {
    Log.warn('ActivityIndicator has been shown for longer than expected', {
        timeoutMs: timeout,
        extraLoadingContext,
        appState: captureAppState(),
    });
}

export type {ExtraLoadingContext};
export default logAppStateOnLongLoading;
