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

        // If we are no longer forcing offline, refresh the NetInfo to trigger a state change which will set isOffline appropriately
        NetInfo.refresh();
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
