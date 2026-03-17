import type {SharedValue} from 'react-native-reanimated';

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

export default createSharedValueMock;
