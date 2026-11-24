import subscribeToBlockedConnections from '@libs/CertificatePinning';
import {recordSuccess} from '@libs/FailureTracker';

import {getCertificatePinningBlockedHost, setCertificatePinningBlockedConnection, setInternetUnreachable, subscribe} from '@src/libs/NetworkState';
import ONYXKEYS from '@src/ONYXKEYS';

import type {NetInfoState} from '@react-native-community/netinfo';

import NetInfo, {NetInfoStateType} from '@react-native-community/netinfo';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

// NetworkState imports Log, which imports Network and SequentialQueue, which call NetworkState.subscribe() while
// NetworkState is still loading, so its listeners Set is undefined. Mocking Log breaks that import cycle.
jest.mock('@src/libs/Log');

jest.mock('@src/CONFIG', () => ({
    __esModule: true,
    default: {IS_USING_LOCAL_WEB: false},
}));

jest.mock('@react-native-community/netinfo', () => ({
    __esModule: true,
    default: {
        configure: jest.fn(),
        refresh: jest.fn(),
        addEventListener: jest.fn(() => () => {}),
        fetch: jest.fn(() => Promise.resolve({})),
    },
    NetInfoStateType: {bluetooth: 'bluetooth', other: 'other'},
}));

jest.mock('@libs/ApiUtils', () => ({
    __esModule: true,
    getApiRoot: jest.fn(() => 'https://test-api.expensify.com/'),
    getCommandURL: jest.fn(() => 'https://test-api.expensify.com/api/Ping?'),
    isQAServerActive: jest.fn(() => false),
}));

jest.mock('@src/libs/Environment/getEnvironment', () => ({
    __esModule: true,
    default: () => Promise.resolve('adhoc'),
}));

jest.mock('@libs/CertificatePinning', () => ({
    __esModule: true,
    default: jest.fn(),
}));

Onyx.init({keys: ONYXKEYS});

const blockedConnection = {
    host: 'www.expensify.com',
    rootCertificateName: 'Zscaler Root CA',
};

// Bluetooth and "other" are the connected network types whose details need no Wi-Fi or cellular fields.
function emitNetInfoState(type: NetInfoStateType.bluetooth | NetInfoStateType.other) {
    const netInfoListener = jest.mocked(NetInfo.addEventListener).mock.calls.at(-1)?.[0];
    const state: NetInfoState = {
        type,
        isConnected: true,
        isInternetReachable: false,
        details: {isConnectionExpensive: false},
    };
    netInfoListener?.(state);
}

describe('NetworkState certificate pinning', () => {
    beforeAll(async () => {
        // NetworkState subscribes to NetInfo only after getEnvironment() resolves.
        await waitForBatchedUpdates();
    });

    beforeEach(() => {
        recordSuccess();
        setInternetUnreachable(false);
    });

    test('subscribes to blocked connections reported by native pinning when the module loads', () => {
        // Given NetworkState has been imported

        // When the module finished its setup

        // Then it listens for blocked connections, so the very first blocked request reaches the UI
        expect(subscribeToBlockedConnections).toHaveBeenCalledWith(setCertificatePinningBlockedConnection);
    });

    test('remembers the blocked host and notifies listeners once', () => {
        // Given a listener of the network state
        const listener = jest.fn();
        const unsubscribe = subscribe(listener);

        // When native pinning reports the same blocked connection for several requests
        setCertificatePinningBlockedConnection(blockedConnection);
        setCertificatePinningBlockedConnection(blockedConnection);

        // Then the host is kept and listeners render the explanation only once
        expect(getCertificatePinningBlockedHost()).toBe('www.expensify.com');
        expect(listener).toHaveBeenCalledTimes(1);
        unsubscribe();
    });

    test('clears the blocked host when a request succeeds', () => {
        // Given a blocked connection
        setCertificatePinningBlockedConnection(blockedConnection);

        // When a request to our server succeeds, which proves its pinned chain was accepted
        recordSuccess();

        // Then the network is no longer reported as intercepting connections
        expect(getCertificatePinningBlockedHost()).toBeUndefined();
    });

    test('clears the blocked host when the device switches to another network', () => {
        // Given a blocked connection on one network
        emitNetInfoState(NetInfoStateType.other);
        setCertificatePinningBlockedConnection(blockedConnection);

        // When the device moves to another network, which may not intercept connections
        emitNetInfoState(NetInfoStateType.bluetooth);

        // Then the new network has to prove it blocks connections before the explanation is shown again
        expect(getCertificatePinningBlockedHost()).toBeUndefined();
    });

    test('keeps the blocked host while the device stays on the same network', () => {
        // Given a blocked connection on one network
        emitNetInfoState(NetInfoStateType.other);
        setCertificatePinningBlockedConnection(blockedConnection);

        // When NetInfo reports another change on the same network, e.g. a failed Ping
        emitNetInfoState(NetInfoStateType.other);

        // Then the explanation stays, because nothing about the intercepting network changed
        expect(getCertificatePinningBlockedHost()).toBe('www.expensify.com');
    });
});
