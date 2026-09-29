import type {MeasurableInput} from '@components/SelectionList/SelectionListWithSections/types';

import type {ComponentRef} from 'react';
import type {NativeScrollEvent, NativeSyntheticEvent, View} from 'react-native';

import {useCallback, useRef} from 'react';

import type {ScrollInputIntoViewOptions, UseScrollToFocusedInput} from './types';

import scrollInputToAnchor from './scrollInputToAnchor';

/**
 * Browsers scroll a focused input into view on their own, so focusing needs no help here.
 *
 * They stop as soon as the caret is on screen though, which leaves an input clipped when a sticky header covers the
 * rest of it. Callers asking to reveal an input above the anchor are correcting exactly that, so those calls run.
 */
const useScrollToFocusedInput: UseScrollToFocusedInput = (listRef) => {
    const containerRef = useRef<ComponentRef<typeof View> | null>(null);
    const scrollOffsetRef = useRef(0);

    const trackScrollOffset = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
        scrollOffsetRef.current = event.nativeEvent.contentOffset.y;
    }, []);

    const scrollInputIntoView = useCallback(
        (input: MeasurableInput, options: ScrollInputIntoViewOptions = {}) => {
            if (!options.shouldRevealInputAboveAnchor) {
                return;
            }

            scrollInputToAnchor({...options, input, containerRef, listRef, getCurrentOffset: () => scrollOffsetRef.current});
        },
        [listRef],
    );

    return {containerRef, trackScrollOffset, scrollInputIntoView};
};

export default useScrollToFocusedInput;
