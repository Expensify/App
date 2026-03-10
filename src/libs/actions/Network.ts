import Onyx from 'react-native-onyx';
import Log from '@libs/Log';
import ONYXKEYS from '@src/ONYXKEYS';

function setNetworkLastOffline(lastOfflineAt: string) {
    Onyx.merge(ONYXKEYS.NETWORK, {lastOfflineAt});
}

function setIsOffline(isNetworkOffline: boolean, reason = '') {
    if (reason) {
        let textToLog = '[Network] Client is';
        textToLog += isNetworkOffline ? ' entering offline mode' : ' back online';
        textToLog += ` because: ${reason}`;
        Log.info(textToLog);
    }
    Onyx.merge(ONYXKEYS.NETWORK, {isOffline: isNetworkOffline});
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

function setShouldSimulatePoorConnection(shouldSimulatePoorConnection: boolean) {
    Onyx.merge(ONYXKEYS.NETWORK, {shouldSimulatePoorConnection});
}

export {setIsOffline, setShouldForceOffline, setShouldSimulatePoorConnection, setShouldFailAllRequests, setTimeSkew, setNetworkLastOffline};
