import Onyx from 'react-native-onyx';
import NetInfo from '@react-native-community/netinfo';
import ONYXKEYS from '../../ONYXKEYS';

/**
 * @param {Boolean} isOffline
 */
function setIsOffline(isOffline) {
    Onyx.merge(ONYXKEYS.NETWORK, {isOffline});
}

/**
 *
 * @param {Boolean} shouldForceOffline
 */
function setShouldForceOffline(shouldForceOffline) {
    if (shouldForceOffline) {
        Onyx.merge(ONYXKEYS.NETWORK, {shouldForceOffline, isOffline: shouldForceOffline});
    } else {
        Onyx.merge(ONYXKEYS.NETWORK, {shouldForceOffline});

        // If we are no longer forcing offline fetch the NetInfo to set isOffline appropriately
        NetInfo.fetch()
            .then(state => setIsOffline(state.isInternetReachable === false));
    }
}

/**
 * Test tool that will fail all network requests when enabled
 * @param {Boolean} shouldFailAllRequests
 */
function setShouldFailAllRequests(shouldFailAllRequests) {
    Onyx.merge(ONYXKEYS.NETWORK, {shouldFailAllRequests});
}

export {
    setIsOffline,
    setShouldForceOffline,
    setShouldFailAllRequests,
};
