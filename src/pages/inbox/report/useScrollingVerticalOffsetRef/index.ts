import {useAnimatedReaction} from 'react-native-reanimated';
import type UseScrollingVerticalOffsetRefParams from './types';

export default function useScrollingVerticalOffsetRef({scrollOffsetRef, scrollY}: UseScrollingVerticalOffsetRefParams) {
    // The previous scroll tracking implementation was made via ref. This is
    // to ensure it will behave the same as before.
    useAnimatedReaction(
        () => {
            return {
                offsetY: scrollY.get(),
            };
        },
        ({offsetY}) => {
            // eslint-disable-next-line no-param-reassign
            scrollOffsetRef.current = offsetY;
        },
    );

    return scrollOffsetRef;
}
