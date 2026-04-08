import type {NetInfoState} from '@react-native-community/netinfo';

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

describe('NetworkState — reachability recovery triggers reconnect', () => {
    let onReachabilityConfirmed: typeof import('@src/libs/NetworkState').onReachabilityConfirmed;
    let setForceOffline: typeof import('@src/libs/NetworkState').setForceOffline;

    beforeEach(() => {
        jest.resetModules();
        netInfoListener = null;

        // Fresh import each test so prevIsInternetReachable resets
        const mod = require<typeof import('@src/libs/NetworkState')>('@src/libs/NetworkState');
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
});
