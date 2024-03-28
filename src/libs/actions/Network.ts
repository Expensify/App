import Onyx from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';

function setIsBackendReachable(isBackendReachable: boolean) {
    Onyx.merge(ONYXKEYS.NETWORK, {isBackendReachable});
}

function setIsOffline(isOffline: boolean) {
    Onyx.merge(ONYXKEYS.NETWORK, {isOffline});
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

export {setIsBackendReachable, setIsOffline, setShouldForceOffline, setShouldFailAllRequests, setTimeSkew};
