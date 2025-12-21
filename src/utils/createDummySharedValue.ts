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

export default createDummySharedValue;
