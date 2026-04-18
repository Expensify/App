import Onyx from 'react-native-onyx';
import {openApp, reconnectApp} from '@libs/actions/App';
import {reconnect} from '@libs/actions/Reconnect';
import type AppStateMonitorType from '@libs/AppStateMonitor';
import {flush} from '@libs/Network/SequentialQueue';
import {getIsOffline, setHasRadio, setSustainedFailures} from '@libs/NetworkState';
import CONST from '@src/CONST';
import type * as NetworkStateType from '@src/libs/NetworkState';
import ONYXKEYS from '@src/ONYXKEYS';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

jest.mock('@libs/Log');
jest.mock('@libs/Network/SequentialQueue', () => ({flush: jest.fn()}));
jest.mock('@libs/actions/App', () => ({openApp: jest.fn(), reconnectApp: jest.fn(), confirmReadyToOpenApp: jest.fn()}));
jest.mock('@libs/AppStateMonitor', () => ({
    // eslint-disable-next-line @typescript-eslint/naming-convention -- required by Jest for ES module interop
    __esModule: true,
    default: {
        addBecameActiveListener: jest.fn(() => jest.fn()),
    },
}));

// Capture the foreground callback registered by Reconnect.ts at module load time.
// Must be extracted before any beforeEach clears mock call history.
// eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access -- extracting callback captured during module load
const AppStateMonitor: typeof AppStateMonitorType = require('@libs/AppStateMonitor').default;

const firstCall = jest.mocked(AppStateMonitor.addBecameActiveListener).mock.calls.at(0);
if (!firstCall) {
    throw new Error('AppStateMonitor.addBecameActiveListener was not called during Reconnect.ts module load');
}
const becameActiveCallback: () => void = firstCall[0];

describe('Reconnect', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await Onyx.clear();
        jest.clearAllMocks();
        setHasRadio(true);
        setSustainedFailures(false);
    });

    test('calls openApp when isLoadingApp is true', async () => {
        await Onyx.merge(ONYXKEYS.SESSION, {accountID: 1234, email: 'test@test.com'});
        await Onyx.merge(ONYXKEYS.IS_LOADING_APP, true);
        await waitForBatchedUpdates();

        reconnect();

        expect(jest.mocked(openApp)).toHaveBeenCalledTimes(1);
        expect(jest.mocked(reconnectApp)).not.toHaveBeenCalled();
    });

    test('calls reconnectApp when isLoadingApp is false', async () => {
        await Onyx.merge(ONYXKEYS.SESSION, {accountID: 1234, email: 'test@test.com'});
        await Onyx.merge(ONYXKEYS.IS_LOADING_APP, false);
        await waitForBatchedUpdates();

        reconnect();

        expect(jest.mocked(reconnectApp)).toHaveBeenCalledTimes(1);
        expect(jest.mocked(openApp)).not.toHaveBeenCalled();
    });

    test('passes lastUpdateIDAppliedToClient to reconnectApp', async () => {
        await Onyx.merge(ONYXKEYS.SESSION, {accountID: 1234, email: 'test@test.com'});
        await Onyx.merge(ONYXKEYS.IS_LOADING_APP, false);
        await Onyx.merge(ONYXKEYS.ONYX_UPDATES_LAST_UPDATE_ID_APPLIED_TO_CLIENT, 42);
        await waitForBatchedUpdates();

        reconnect();

        expect(jest.mocked(reconnectApp)).toHaveBeenCalledWith(42);
    });

    test('is a no-op when there is no active session', async () => {
        await waitForBatchedUpdates();

        reconnect();

        expect(jest.mocked(openApp)).not.toHaveBeenCalled();
        expect(jest.mocked(reconnectApp)).not.toHaveBeenCalled();
    });

    test('offline→online transition flushes the sequential queue', () => {
        setHasRadio(false);
        expect(getIsOffline()).toBe(true);

        jest.mocked(flush).mockClear();

        setHasRadio(true);
        expect(getIsOffline()).toBe(false);

        expect(jest.mocked(flush)).toHaveBeenCalledTimes(1);
    });

    test('sustained failure recovery notifies reachability listeners', () => {
        // eslint-disable-next-line @typescript-eslint/no-require-imports -- accessing the module for the subscription API
        const {onReachabilityConfirmed} = require<typeof NetworkStateType>('@libs/NetworkState');
        const listener = jest.fn();
        const unsub = onReachabilityConfirmed(listener);

        setSustainedFailures(true);
        listener.mockClear();

        // Fake timers required: setSustainedFailures(false) schedules notifyReconnectListeners
        // via setTimeout with random jitter (0–5s). setupAfterEnv restores real timers by default.
        jest.useFakeTimers();
        setSustainedFailures(false);
        jest.advanceTimersByTime(CONST.NETWORK.RECONNECT_STAMPEDE_JITTER_MS);
        jest.useRealTimers();

        expect(listener).toHaveBeenCalledTimes(1);
        unsub();
    });

    test('reachability confirmed triggers reconnect when sustained failures clear', async () => {
        await Onyx.merge(ONYXKEYS.SESSION, {accountID: 1234, email: 'test@test.com'});
        await Onyx.merge(ONYXKEYS.IS_LOADING_APP, false);
        await waitForBatchedUpdates();

        setSustainedFailures(true);
        jest.mocked(reconnectApp).mockClear();

        // Fake timers required: the jitter setTimeout must be advanced manually
        jest.useFakeTimers();
        setSustainedFailures(false);
        jest.advanceTimersByTime(CONST.NETWORK.RECONNECT_STAMPEDE_JITTER_MS);
        jest.useRealTimers();

        expect(jest.mocked(reconnectApp)).toHaveBeenCalledTimes(1);
    });

    test('foreground triggers reconnect and flush when app becomes active while online', async () => {
        await Onyx.merge(ONYXKEYS.SESSION, {accountID: 1234, email: 'test@test.com'});
        await Onyx.merge(ONYXKEYS.IS_LOADING_APP, false);
        await waitForBatchedUpdates();

        expect(getIsOffline()).toBe(false);
        jest.mocked(reconnectApp).mockClear();
        jest.mocked(flush).mockClear();

        becameActiveCallback();

        expect(jest.mocked(reconnectApp)).toHaveBeenCalledTimes(1);
        expect(jest.mocked(flush)).toHaveBeenCalledTimes(1);
    });

    test('foreground refreshes network state when app becomes active while offline', async () => {
        // eslint-disable-next-line @typescript-eslint/no-require-imports -- accessing NetworkState for spy
        const NetworkState = require<typeof NetworkStateType>('@libs/NetworkState');
        const refreshSpy = jest.spyOn(NetworkState, 'refresh').mockImplementation(() => {});

        await Onyx.merge(ONYXKEYS.SESSION, {accountID: 1234, email: 'test@test.com'});
        await Onyx.merge(ONYXKEYS.IS_LOADING_APP, false);
        await waitForBatchedUpdates();

        setHasRadio(false);
        expect(getIsOffline()).toBe(true);

        refreshSpy.mockClear();
        jest.mocked(flush).mockClear();

        becameActiveCallback();

        expect(refreshSpy).toHaveBeenCalledTimes(1);
        expect(jest.mocked(flush)).toHaveBeenCalledTimes(1);

        refreshSpy.mockRestore();
    });
});
