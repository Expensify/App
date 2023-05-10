const defaultState = {
    type: 'cellular',
    isConnected: true,
    isInternetReachable: true,
    details: {
        isConnectionExpensive: true,
        cellularGeneration: '3g',
    },
};

const RNCNetInfoMock = {
    configure: () => {},
    fetch: () => Promise.resolve(defaultState),
    refresh: () => Promise.resolve(defaultState),
    addEventListener: () => (() => {}),
    useNetInfo: () => {},
};

export default RNCNetInfoMock;
