import Onyx from 'react-native-onyx';
import Log from '@libs/Log';
import type {NetworkStatus} from '@libs/NetworkConnection';
import ONYXKEYS from '@src/ONYXKEYS';

function setIsBackendReachable(isBackendReachable: boolean, reason: string) {
    if (isBackendReachable) {
        Log.info(`[Network] Backend is reachable because: ${reason}`);
    } else {
        Log.info(`[Network] Backend is not reachable because: ${reason}`);
    }
    Onyx.merge(ONYXKEYS.NETWORK, {isBackendReachable});
}

function setIsOffline(isOffline: boolean, reason = '') {
    if (isOffline) {
        Log.info(`[Network] Client is entering offline mode because: ${reason}`);
    } else {
        Log.info(`[Network] Client is back online because: ${reason}`);
    }
    Onyx.merge(ONYXKEYS.NETWORK, {isOffline});
}

function setNetWorkStatus(status: NetworkStatus) {
    Onyx.merge(ONYXKEYS.NETWORK, {networkStatus: status});
}

function setTimeSkew(skew: number) {
    Onyx.merge(ONYXKEYS.NETWORK, {timeSkew: skew});
}

function setShouldForceOffline(shouldForceOffline: boolean) {
    Onyx.merge(ONYXKEYS.NETWORK, {shouldForceOffline});
}

/**
 * Test tool that will fail all network requests when enabled
 */
function setShouldFailAllRequests(shouldFailAllRequests: boolean) {
    Onyx.merge(ONYXKEYS.NETWORK, {shouldFailAllRequests});
}

export {setIsBackendReachable, setIsOffline, setShouldForceOffline, setShouldFailAllRequests, setTimeSkew, setNetWorkStatus};
