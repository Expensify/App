import {useState} from 'react';
import type {LayoutChangeEvent} from 'react-native';
import type StableListWidthResult from './types';

/**
 * On web, FlashList feeds its scroll content width back into its own layout. When the vertical
 * scrollbar appears/disappears, the measured width oscillates by the scrollbar size, retriggering
 * layout in a loop until React throws "Maximum update depth exceeded" (#185) and crashes. Measuring
 * a stable border-box width from `onLayout` (which doesn't change with the scrollbar) and pinning the
 * content container to it as a fixed pixel width breaks that loop.
 */
export default function useStableListWidth(): StableListWidthResult {
    const [stableListWidth, setStableListWidth] = useState<number>();

    const onStableListLayout = (event: LayoutChangeEvent) => {
        setStableListWidth(event.nativeEvent.layout.width);
    };

    return {stableListWidth, onStableListLayout};
}
