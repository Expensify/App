import type {addEventListener, configure, fetch, NetInfoState, refresh, useNetInfo} from '@react-native-community/netinfo';

const defaultState = {
    type: 'cellular',
    isConnected: true,
    isInternetReachable: true,
    details: {
        isConnectionExpensive: true,
        cellularGeneration: '3g',
        carrier: 'T-Mobile',
    },
} as NetInfoState;

type NetInfoMock = {
    configure: typeof configure;
    fetch: typeof fetch;
    refresh: typeof refresh;
    addEventListener: typeof addEventListener;
    useNetInfo: typeof useNetInfo;
};

const netInfoMock: NetInfoMock = {
    configure: () => {},
    fetch: () => Promise.resolve(defaultState),
    refresh: () => Promise.resolve(defaultState),
    addEventListener: () => () => {},
    useNetInfo: () => defaultState,
};

export default netInfoMock;
