import type {SharedValue} from 'react-native-reanimated';

/**
 * Creates a dummy shared value with a static value
 * This can be used for initial values in contexts, etc.
 * @param value
 * @returns
 */
const createDummySharedValue = <T>(value?: T): SharedValue<T> =>
    ({
        value,
        get: () => value,
        set: () => {},
        addListener: () => value,
        removeListener: () => {},
        modify: () => {},
    }) as SharedValue<T>;

/**
 * Creates a shared value mock for testing.
 * This wraps all shared value methods with mocks, so they can be tested.
 * @param value
 * @returns
 */
const createSharedValueMock = <T>(value?: T): SharedValue<T> =>
    ({
        value,
        get: jest.fn(() => value),
        set: jest.fn(),
        addListener: jest.fn(),
        removeListener: jest.fn(),
        modify: jest.fn(),
    }) as SharedValue<T>;

export {createDummySharedValue, createSharedValueMock};
