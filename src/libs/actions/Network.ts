import Onyx from 'react-native-onyx';
import ONYXKEYS from '../../ONYXKEYS';

function setIsOffline(isOffline: boolean) {
    Onyx.merge(ONYXKEYS.NETWORK, {isOffline});
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

export {setIsOffline, setShouldForceOffline, setShouldFailAllRequests};
