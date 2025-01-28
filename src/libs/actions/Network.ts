import Onyx from 'react-native-onyx';
import Log from '@libs/Log';
import type {NetworkStatus} from '@libs/NetworkConnection';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ConnectionChanges} from '@src/types/onyx/Network';

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

function setPoorConnectionTimeoutID(poorConnectionTimeoutID: NodeJS.Timeout | undefined) {
    Onyx.merge(ONYXKEYS.NETWORK, {poorConnectionTimeoutID});
}

function setShouldSimulatePoorConnection(shouldSimulatePoorConnection: boolean, poorConnectionTimeoutID: NodeJS.Timeout | undefined) {
    if (!shouldSimulatePoorConnection) {
        clearTimeout(poorConnectionTimeoutID);
        Onyx.merge(ONYXKEYS.NETWORK, {shouldSimulatePoorConnection, poorConnectionTimeoutID: undefined});
        return;
    }
    Onyx.merge(ONYXKEYS.NETWORK, {shouldSimulatePoorConnection});
}

function setConnectionChanges(connectionChanges: ConnectionChanges) {
    Onyx.merge(ONYXKEYS.NETWORK, {connectionChanges});
}

export {setIsOffline, setShouldForceOffline, setConnectionChanges, setShouldSimulatePoorConnection, setPoorConnectionTimeoutID, setShouldFailAllRequests, setTimeSkew, setNetWorkStatus};
