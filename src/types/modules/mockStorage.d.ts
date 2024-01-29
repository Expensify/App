declare module 'react-native-onyx/lib/storage/__mocks__' {
    const mockStorage: {
        idbKeyvalSet: jest.MockedFunction<() => Promise<unknown>>;
        setItem: jest.MockedFunction<() => Promise<unknown>>;
        getItem: jest.MockedFunction<() => Promise<unknown>>;
        removeItem: jest.MockedFunction<() => Promise<void>>;
        removeItems: jest.MockedFunction<() => Promise<void>>;
        clear: jest.MockedFunction<() => Promise<void>>;
        getAllKeys: jest.MockedFunction<() => Promise<string[]>>;
        config: jest.MockedFunction<() => void>;
        multiGet: jest.MockedFunction<() => Promise<unknown[]>>;
        multiSet: jest.MockedFunction<() => Promise<unknown>>;
        multiMerge: jest.MockedFunction<() => Promise<unknown>>;
        mergeItem: jest.MockedFunction<() => Promise<unknown>>;
        getStorageMap: jest.MockedFunction<() => unknown>;
        setInitialMockData: jest.MockedFunction<(data: unknown) => void>;
        getDatabaseSize: jest.MockedFunction<
            () => Promise<{
                bytesRemaining: number;
                bytesUsed: number;
            }>
        >;
        setMemoryOnlyKeys: jest.MockedFunction<() => void>;
    };

    export default mockStorage;
}
