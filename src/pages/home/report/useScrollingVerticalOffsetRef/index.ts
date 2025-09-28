import {useRef} from 'react';
import {useAnimatedReaction} from 'react-native-reanimated';
import type UseScrollingVerticalOffsetRefParams from './types';

export default function useScrollingVerticalOffsetRef({scrollY}: UseScrollingVerticalOffsetRefParams) {
    const scrollingVerticalOffsetRef = useRef(0);

    // The previous scroll tracking implementation was made via ref. This is
    // to ensure it will behave the same as before.
    useAnimatedReaction(
        () => {
            return {
                offsetY: scrollY.get(),
            };
        },
        ({offsetY}) => {
            scrollingVerticalOffsetRef.current = offsetY;
        },
    );

    return scrollingVerticalOffsetRef;
}
