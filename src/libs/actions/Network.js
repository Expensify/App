import Onyx from 'react-native-onyx';
import ONYXKEYS from '../../ONYXKEYS';

/**
 * @param {Boolean} isLoadingAfterReconnect
 */
function setIsLoadingAfterReconnect(isLoadingAfterReconnect) {
    Onyx.set(ONYXKEYS.IS_LOADING_AFTER_RECONNECT, isLoadingAfterReconnect);
}

/**
 * @param {Boolean} isOffline
 */
function setIsOffline(isOffline) {
    Onyx.merge(ONYXKEYS.NETWORK, {isOffline});
}

/**
 * Test tool that will fail all network requests when enabled
 * @param {Boolean} shouldFailAllRequests
 */
function setShouldFailAllRequests(shouldFailAllRequests) {
    Onyx.merge(ONYXKEYS.NETWORK, {shouldFailAllRequests});
}

export {
    setIsLoadingAfterReconnect,
    setIsOffline,
    setShouldFailAllRequests,
};
