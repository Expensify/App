import {NetInfoCellularGeneration, NetInfoStateType} from '@react-native-community/netinfo';
import type {addEventListener, configure, fetch, NetInfoState, refresh, useNetInfo} from '@react-native-community/netinfo';

const defaultState: NetInfoState = {
    type: NetInfoStateType?.cellular,
    isConnected: true,
    isInternetReachable: true,
    details: {
        isConnectionExpensive: true,
        cellularGeneration: NetInfoCellularGeneration?.['3g'],
        carrier: 'T-Mobile',
    },
};

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
