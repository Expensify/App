import type {MeasurableInput} from '@components/SelectionList/SelectionListWithSections/types';

import type {ComponentRef} from 'react';
import type {View} from 'react-native';

import {useRef} from 'react';

import type {UseScrollToFocusedInput} from './types';

import getScrollDeltaToReveal from './getScrollDeltaToReveal';

const noop = () => {};

/**
 * Browsers already scroll a focused input into view, so on web only revealing a view that isn't focused needs work.
 * `containerRef` is still returned so the list can attach it harmlessly.
 */
const useScrollToFocusedInput: UseScrollToFocusedInput = (listRef) => {
    const containerRef = useRef<ComponentRef<typeof View> | null>(null);

    const scrollToReveal = (view: MeasurableInput) => {
        const list = listRef.current;
        // `scrollIntoView` can't keep a gap from the list's edges, so the list scrolls by the same amount native does.
        const scroller = list?.getNativeScrollRef();
        if (!list || !(view instanceof HTMLElement) || !(scroller instanceof HTMLElement)) {
            return;
        }
        const viewRect = view.getBoundingClientRect();
        const scrollerRect = scroller.getBoundingClientRect();
        const delta = getScrollDeltaToReveal({top: viewRect.top, height: viewRect.height}, {top: scrollerRect.top, height: scrollerRect.height});
        if (delta === 0) {
            return;
        }
        list.scrollToOffset({offset: scroller.scrollTop + delta, animated: true});
    };

    return {containerRef, trackScrollOffset: noop, scrollInputIntoView: noop, scrollToReveal};
};

export default useScrollToFocusedInput;
