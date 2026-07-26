const NetInfo = {
    configure: () => {},
    addEventListener: (callback: (state: {isConnected: boolean; isInternetReachable: boolean; type: string}) => void) => {
        queueMicrotask(() => {
            callback({
                isConnected: true,
                isInternetReachable: true,
                type: 'wifi',
            });
        });
        return () => {};
    },
    refresh: () => Promise.resolve(),
    fetch: () =>
        Promise.resolve({
            isConnected: true,
            isInternetReachable: true,
            type: 'wifi',
        }),
};

export default NetInfo;
