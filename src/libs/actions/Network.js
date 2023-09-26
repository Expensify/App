import Onyx from 'react-native-onyx';
import ONYXKEYS from '../../ONYXKEYS';

/**
 * @param {Boolean} isOffline
 */
function setIsOffline(isOffline) {
    Onyx.merge(ONYXKEYS.NETWORK, {isOffline});
}

/**
 * @param {Number} skew
 */
function setTimeSkew(skew) {
    Onyx.merge(ONYXKEYS.NETWORK, {timeSkew: skew});
}

/**
 *
 * @param {Boolean} shouldForceOffline
 */
function setShouldForceOffline(shouldForceOffline) {
    Onyx.merge(ONYXKEYS.NETWORK, {shouldForceOffline});
}

/**
 * Test tool that will fail all network requests when enabled
 * @param {Boolean} shouldFailAllRequests
 */
function setShouldFailAllRequests(shouldFailAllRequests) {
    Onyx.merge(ONYXKEYS.NETWORK, {shouldFailAllRequests});
}

export {setIsOffline, setShouldForceOffline, setShouldFailAllRequests, setTimeSkew};
