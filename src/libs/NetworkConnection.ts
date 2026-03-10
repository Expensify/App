import NetInfo from '@react-native-community/netinfo';
import Onyx from 'react-native-onyx';
import CONFIG from '@src/CONFIG';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type Network from '@src/types/onyx/Network';
import {setIsOffline, setNetworkLastOffline} from './actions/Network';
import DateUtils from './DateUtils';
import Log from './Log';
import NetworkState from './NetworkState';

type ResponseJSON = {
    jsonCode: number;
};

let networkTimeSkew = 0;
let shouldForceOffline = false;
let isPoorConnectionSimulated: boolean | undefined;
let isOfflineFlag: boolean | undefined;
let accountID: number | undefined;
let unsubscribeNetInfo: (() => void) | null = null;

Onyx.connectWithoutView({
    key: ONYXKEYS.SESSION,
    callback: (session) => {
        const newAccountID = session?.accountID;
        if (newAccountID === accountID) {
            return;
        }
        accountID = newAccountID;
        configureAndSubscribe();
    },
});

Onyx.connectWithoutView({
    key: ONYXKEYS.NETWORK,
    callback: (network) => {
        if (!network) {
            return;
        }

        networkTimeSkew = network?.timeSkew ?? 0;
        if (!network?.lastOfflineAt) {
            setNetworkLastOffline(new Date().toISOString());
        }

        const newIsOffline = network?.isOffline ?? network?.shouldForceOffline;
        if (newIsOffline && isOfflineFlag === false) {
            setNetworkLastOffline(new Date().toISOString());
        }
        isOfflineFlag = newIsOffline;

        simulatePoorConnection(network);
        isPoorConnectionSimulated = !!network.shouldSimulatePoorConnection;

        const currentShouldForceOffline = !!network.shouldForceOffline;
        if (currentShouldForceOffline === shouldForceOffline) {
            return;
        }
        shouldForceOffline = currentShouldForceOffline;
        NetworkState.setForceOffline(shouldForceOffline);
    },
});

/**
 * Returns the current time plus skew in milliseconds in the format expected by the database
 */
function getDBTimeWithSkew(timestamp: string | number = ''): string {
    if (networkTimeSkew > 0) {
        const datetime = timestamp ? new Date(timestamp) : new Date();
        return DateUtils.getDBTime(datetime.valueOf() + networkTimeSkew);
    }
    return DateUtils.getDBTime(timestamp);
}

function simulatePoorConnection(network: Network) {
    // Starts random network status change when shouldSimulatePoorConnection is turned on
    if (!isPoorConnectionSimulated && !!network.shouldSimulatePoorConnection) {
        setRandomNetworkStatus(true);
    }

    // Restore real state when simulation is turned off
    if (isPoorConnectionSimulated && !network.shouldSimulatePoorConnection) {
        NetInfo.fetch().then((state) => {
            const hasRadio = state.isConnected !== false;
            NetworkState.setNoRadio(!hasRadio);
            Log.info(`[NetworkConnection] Poor connection simulation turned off. Radio: ${hasRadio}`);
        });
    }
}

/** Sets online/offline connection randomly every 2-5 seconds */
function setRandomNetworkStatus(initialCall = false) {
    if (!isPoorConnectionSimulated && !initialCall) {
        return;
    }

    const isOffline = Math.random() < 0.5;
    const randomInterval = Math.random() * (5000 - 2000) + 2000;
    Log.info(`[NetworkConnection] Simulating ${isOffline ? 'offline' : 'online'} for ${randomInterval}ms`);

    setIsOffline(isOffline);
    setTimeout(setRandomNetworkStatus, randomInterval);
}

/**
 * Configure NetInfo with the reachability URL and subscribe to state changes.
 * Must unsubscribe before calling configure() — configure tears down NetInfo internal state.
 */
function configureAndSubscribe() {
    if (unsubscribeNetInfo) {
        unsubscribeNetInfo();
        unsubscribeNetInfo = null;
    }

    if (!CONFIG.IS_USING_LOCAL_WEB) {
        NetInfo.configure({
            reachabilityUrl: `${CONFIG.EXPENSIFY.DEFAULT_API_ROOT}api/Ping?accountID=${accountID ?? 'unknown'}`,
            reachabilityMethod: 'GET',
            reachabilityTest: (response) => {
                if (!response.ok) {
                    return Promise.resolve(false);
                }
                return response
                    .json()
                    .then((json: ResponseJSON) => Promise.resolve(json.jsonCode === 200))
                    .catch(() => Promise.resolve(false));
            },
            reachabilityRequestTimeout: CONST.NETWORK.MAX_PENDING_TIME_MS,
        });
    }

    unsubscribeNetInfo = NetInfo.addEventListener((state) => {
        if (shouldForceOffline) {
            Log.info('[NetworkConnection] Not processing NetInfo state because shouldForceOffline = true');
            return;
        }

        const hasRadio = state.isConnected !== false;
        Log.info(`[NetworkConnection] NetInfo state change: isConnected=${state.isConnected}, type=${state.type}`);
        NetworkState.setNoRadio(!hasRadio);
    });
}

export default {
    getDBTimeWithSkew,
};
