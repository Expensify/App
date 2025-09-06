import type {SharedValue} from 'react-native-reanimated';

type UseScrollingVerticalOffsetRefParams = {
    scrollY: SharedValue<number>;
    keyboardHeight: SharedValue<number>;
    contentSizeHeight: SharedValue<number>;
    layoutMeasurementHeight: SharedValue<number>;
    isTransactionThreadResult: boolean;
};

export default UseScrollingVerticalOffsetRefParams;
