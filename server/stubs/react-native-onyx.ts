import {useMemo} from 'react';

const noopConnection = {id: 0};

function invokeCallback<T>(callback: ((value: T) => void) | undefined, value: T) {
    if (callback) {
        queueMicrotask(() => callback(value));
    }
}

const Onyx = {
    METHOD: {},
    connect: (options: {callback?: (value: unknown) => void}) => {
        invokeCallback(options.callback, undefined);
        return noopConnection;
    },
    connectWithoutView: (options: {callback?: (value: unknown) => void}) => {
        invokeCallback(options.callback, undefined);
        return noopConnection;
    },
    disconnect: () => {},
    set: () => Promise.resolve(),
    multiSet: () => Promise.resolve(),
    merge: () => Promise.resolve(),
    mergeCollection: () => Promise.resolve(),
    setCollection: () => Promise.resolve(),
    update: () => Promise.resolve(),
    clear: () => Promise.resolve(),
    init: () => {},
    registerLogger: () => {},
};

function useOnyx() {
    return useMemo(() => [undefined, {status: 'loaded' as const, isLoading: false}], []);
}

export {useOnyx};
export default Onyx;
