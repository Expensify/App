import type {NetInfoState} from '@react-native-community/netinfo';
import type * as NetworkState from '@src/libs/NetworkState';

let netInfoListener: ((state: NetInfoState) => void) | null = null;

jest.mock('@react-native-community/netinfo', () => ({
    addEventListener: jest.fn((cb: (state: NetInfoState) => void) => {
        netInfoListener = cb;
        return () => {
            netInfoListener = null;
        };
    }),
    configure: jest.fn(),
    refresh: jest.fn(),
    fetch: jest.fn(),
}));

jest.mock('@src/libs/Log');
jest.mock('react-native-onyx', () => ({
    connectWithoutView: jest.fn(),
}));

function fireNetInfoState(overrides: Partial<NetInfoState>) {
    if (!netInfoListener) {
        throw new Error('NetInfo listener not registered');
    }
    netInfoListener({
        isConnected: true,
        isInternetReachable: true,
        type: 'wifi' as NetInfoState['type'],
        details: null,
        ...overrides,
    } as NetInfoState);
}

describe('NetworkState — internetUnreachable hard stop via NetInfo', () => {
    let getIsOffline: typeof NetworkState.getIsOffline;

    beforeEach(() => {
        jest.resetModules();
        netInfoListener = null;

        const mod = require<typeof NetworkState>('@src/libs/NetworkState');
        getIsOffline = mod.getIsOffline;
    });

    test('null→false fires internetUnreachable (cold start ping failure)', () => {
        // First event delivers null (indeterminate, ping hasn't completed yet)
        fireNetInfoState({isInternetReachable: null});
        expect(getIsOffline()).toBe(false);

        // Ping completes and fails — should trigger internetUnreachable
        fireNetInfoState({isInternetReachable: false});
        expect(getIsOffline()).toBe(true);
    });

    test('true→false fires internetUnreachable', () => {
        fireNetInfoState({isInternetReachable: true});
        expect(getIsOffline()).toBe(false);

        fireNetInfoState({isInternetReachable: false});
        expect(getIsOffline()).toBe(true);
    });

    test('false→false does not re-trigger (already offline)', () => {
        // Go offline
        fireNetInfoState({isInternetReachable: null});
        fireNetInfoState({isInternetReachable: false});
        expect(getIsOffline()).toBe(true);

        // Redundant false event — should not cause issues
        fireNetInfoState({isInternetReachable: false});
        expect(getIsOffline()).toBe(true);
    });
});

describe('NetworkState — reachability recovery triggers reconnect', () => {
    let onReachabilityConfirmed: typeof NetworkState.onReachabilityConfirmed;
    let setForceOffline: typeof NetworkState.setForceOffline;

    beforeEach(() => {
        jest.resetModules();
        netInfoListener = null;

        // Fresh import each test so prevIsInternetReachable resets
        const mod = require<typeof NetworkState>('@src/libs/NetworkState');
        onReachabilityConfirmed = mod.onReachabilityConfirmed;
        setForceOffline = mod.setForceOffline;
    });

    test('false→true fires reconnect listener', () => {
        const reconnectListener = jest.fn();
        onReachabilityConfirmed(reconnectListener);

        // Simulate going unreachable then recovering
        fireNetInfoState({isInternetReachable: false});
        fireNetInfoState({isInternetReachable: true});

        expect(reconnectListener).toHaveBeenCalledTimes(1);
    });

    test('null→true fires reconnect listener', () => {
        const reconnectListener = jest.fn();
        onReachabilityConfirmed(reconnectListener);

        // Simulate losing reachability tracking (null) then recovering
        fireNetInfoState({isInternetReachable: null});
        fireNetInfoState({isInternetReachable: true});

        expect(reconnectListener).toHaveBeenCalledTimes(1);
    });

    test('undefined→true does NOT fire reconnect listener (boot event)', () => {
        const reconnectListener = jest.fn();
        onReachabilityConfirmed(reconnectListener);

        // First NetInfo event on subscribe delivers current state (undefined→true)
        // This is not a recovery — should not trigger reconnect
        fireNetInfoState({isInternetReachable: true});

        expect(reconnectListener).not.toHaveBeenCalled();
    });

    test('true→true does NOT fire reconnect listener', () => {
        const reconnectListener = jest.fn();
        onReachabilityConfirmed(reconnectListener);

        fireNetInfoState({isInternetReachable: true});
        fireNetInfoState({isInternetReachable: true});

        expect(reconnectListener).not.toHaveBeenCalled();
    });

    test('recovery does NOT fire reconnect when shouldForceOffline is active', () => {
        const reconnectListener = jest.fn();
        onReachabilityConfirmed(reconnectListener);

        setForceOffline(true);

        fireNetInfoState({isInternetReachable: false});
        fireNetInfoState({isInternetReachable: true});

        expect(reconnectListener).not.toHaveBeenCalled();
    });

    test('turning off force-offline resets prevIsInternetReachable so next refresh triggers reconnect', () => {
        const reconnectListener = jest.fn();
        onReachabilityConfirmed(reconnectListener);

        // Boot event — sets prevIsInternetReachable to true
        fireNetInfoState({isInternetReachable: true});
        expect(reconnectListener).not.toHaveBeenCalled();

        // Enable force-offline. Real network stays reachable throughout.
        setForceOffline(true);
        fireNetInfoState({isInternetReachable: true});
        expect(reconnectListener).not.toHaveBeenCalled();

        // Disable force-offline. This resets prevIsInternetReachable to null.
        setForceOffline(false);

        // NetInfo.refresh() would deliver current state — simulate that.
        // With the fix, prevIsInternetReachable is null so null→true fires reconnect.
        fireNetInfoState({isInternetReachable: true});
        expect(reconnectListener).toHaveBeenCalledTimes(1);
    });
});
