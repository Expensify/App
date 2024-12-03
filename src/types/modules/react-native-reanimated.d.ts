import type {SharedValue as ReanimatedSharedValue} from 'react-native-reanimated';

// Remove this augmentation once `value` property is deprecated in reanimated
declare module 'react-native-reanimated' {
    // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
    interface SharedValue<Value = unknown> extends ReanimatedSharedValue<Value> {
        /**
         * @deprecated Use the new `.get()` and `.set(value)` methods instead.
         */
        value: Value;
    }
}
