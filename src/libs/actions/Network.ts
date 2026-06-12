import Onyx from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';

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

function setShouldSimulatePoorConnection(shouldSimulatePoorConnection: boolean) {
    Onyx.merge(ONYXKEYS.NETWORK, {shouldSimulatePoorConnection});
}

export {setShouldForceOffline, setShouldSimulatePoorConnection, setShouldFailAllRequests, setTimeSkew};
