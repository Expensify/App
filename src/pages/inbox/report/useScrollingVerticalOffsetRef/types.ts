import type {RefObject} from 'react';
import type {SharedValue} from 'react-native-reanimated';

type UseScrollingVerticalOffsetRefParams = {
    scrollOffsetRef: RefObject<number>;
    scrollY: SharedValue<number>;
    keyboardHeight: SharedValue<number>;
};

export default UseScrollingVerticalOffsetRefParams;
