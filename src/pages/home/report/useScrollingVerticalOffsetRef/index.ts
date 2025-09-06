import {useRef} from 'react';
import {useAnimatedReaction} from 'react-native-reanimated';
import type UseScrollingVerticalOffsetRefParams from './types';

export default function useScrollingVerticalOffsetRef({contentSizeHeight, keyboardHeight, layoutMeasurementHeight, scrollY, isTransactionThreadResult}: UseScrollingVerticalOffsetRefParams) {
    const scrollingVerticalOffsetRef = useRef(0);

    // The previous scroll tracking implementation was made via ref. This is
    // to ensure it will behave the same as before.
    useAnimatedReaction(
        () => {
            return {
                offsetY: scrollY.get(),
                kHeight: keyboardHeight.get(),
                csHeight: contentSizeHeight.get(),
                lmHeight: layoutMeasurementHeight.get(),
            };
        },
        ({offsetY, csHeight, lmHeight}) => {
            if (isTransactionThreadResult) {
                // For transaction threads, calculate distance from bottom like MoneyRequestReportActionsList
                scrollingVerticalOffsetRef.current = csHeight - lmHeight - offsetY;
            } else {
                // For regular reports (InvertedFlatList), use raw contentOffset.y
                scrollingVerticalOffsetRef.current = offsetY;
            }
        },
    );

    return scrollingVerticalOffsetRef;
}
