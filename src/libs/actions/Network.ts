import Onyx from 'react-native-onyx';
import Log from '@libs/Log';
import type {NetworkStatus} from '@libs/NetworkConnection';
import ONYXKEYS from '@src/ONYXKEYS';
import setTimeSkew from './setTimeSkew';

function setIsOffline(isOffline: boolean, reason = '') {
    if (reason) {
        let textToLog = '[Network] Client is';
        textToLog += isOffline ? ' entering offline mode' : ' back online';
        textToLog += ` because: ${reason}`;
        Log.info(textToLog);
    }
    Onyx.merge(ONYXKEYS.NETWORK, {isOffline});
}

function setNetWorkStatus(status: NetworkStatus) {
    Onyx.merge(ONYXKEYS.NETWORK, {networkStatus: status});
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

export {setIsOffline, setShouldForceOffline, setShouldFailAllRequests, setTimeSkew, setNetWorkStatus};
