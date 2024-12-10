import {differenceInHours} from 'date-fns/differenceInHours';
import Onyx from 'react-native-onyx';
import Log from '@libs/Log';
import type {NetworkStatus} from '@libs/NetworkConnection';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ConnectionChanges} from '@src/types/onyx/Network';

let isPoorConnectionSimulated: boolean | undefined;
let connectionChanges: ConnectionChanges | undefined;
Onyx.connect({
    key: ONYXKEYS.NETWORK,
    callback: (value) => {
        if (!value) {
            return;
        }

        // Starts random network status change when shouldSimulatePoorConnection is turned into true
        // or after app restart if shouldSimulatePoorConnection is true already
        if (!isPoorConnectionSimulated && !!value.shouldSimulatePoorConnection) {
            clearTimeout(value.poorConnectionTimeoutID);
            setRandomNetworkStatus(true);
        }

        isPoorConnectionSimulated = !!value.shouldSimulatePoorConnection;
        connectionChanges = value.connectionChanges;
    },
});

function trackConnectionChanges() {
    if (!connectionChanges?.startTime) {
        Onyx.merge(ONYXKEYS.NETWORK, {connectionChanges: {startTime: new Date().getTime(), amount: 1}});
        return;
    }

    const diffInHours = differenceInHours(new Date(), connectionChanges.startTime);
    const newAmount = (connectionChanges.amount ?? 0) + 1;

    if (diffInHours < 1) {
        Onyx.merge(ONYXKEYS.NETWORK, {connectionChanges: {amount: newAmount}});
        return;
    }

    Log.info(
        `[NetworkConnection] Connection has changed ${newAmount} time(s) for the last ${diffInHours} hour(s). Poor connection simulation is turned ${
            isPoorConnectionSimulated ? 'on' : 'off'
        }`,
    );

    Onyx.merge(ONYXKEYS.NETWORK, {connectionChanges: {startTime: new Date().getTime(), amount: 0}});
}

function setIsOffline(isOffline: boolean, reason = '') {
    if (reason) {
        let textToLog = '[Network] Client is';
        textToLog += isOffline ? ' entering offline mode' : ' back online';
        textToLog += ` because: ${reason}`;
        Log.info(textToLog);
    }

    trackConnectionChanges();

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

function setRandomNetworkStatus(initialCall = false) {
    // The check to ensure no new timeouts are scheduled after poor connection simulation is stopped
    if (!isPoorConnectionSimulated && !initialCall) {
        setShouldForceOffline(false);
        return;
    }

    const statuses = [CONST.NETWORK.NETWORK_STATUS.OFFLINE, CONST.NETWORK.NETWORK_STATUS.ONLINE];
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
    const randomInterval = Math.random() * (5000 - 2000) + 2000; // random interval between 2-5 seconds
    Log.info(`[NetworkConnection] Set connection status "${randomStatus}" for ${randomInterval} sec`);

    setShouldForceOffline(randomStatus === CONST.NETWORK.NETWORK_STATUS.OFFLINE);

    const timeoutID = setTimeout(setRandomNetworkStatus, randomInterval);

    setPoorConnectionTimeoutID(timeoutID);
}

function simulatePoorConnection(shouldSimulatePoorConnection: boolean, poorConnectionTimeoutID: NodeJS.Timeout | undefined) {
    if (!shouldSimulatePoorConnection) {
        clearTimeout(poorConnectionTimeoutID);
        setPoorConnectionTimeoutID(undefined);
        setShouldForceOffline(false);
    }

    Onyx.merge(ONYXKEYS.NETWORK, {shouldSimulatePoorConnection});
}

export {setIsOffline, setShouldForceOffline, setShouldFailAllRequests, setTimeSkew, setNetWorkStatus, simulatePoorConnection};
