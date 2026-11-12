import type {MeasurableInput} from '@components/SelectionList/SelectionListWithSections/types';

import type {ComponentRef} from 'react';
import type {View} from 'react-native';

import {useRef} from 'react';

import type {UseScrollToFocusedInput} from './types';

const noop = () => {};

/**
 * Browsers already scroll a focused input into view, so on web only revealing a view that isn't focused needs work.
 * `containerRef` is still returned so the list can attach it harmlessly.
 */
const useScrollToFocusedInput: UseScrollToFocusedInput = () => {
    const containerRef = useRef<ComponentRef<typeof View> | null>(null);

    // A view is its own element on web, so the browser can scroll the list to it without any measuring.
    const scrollToReveal = (view: MeasurableInput) => {
        if (!(view instanceof HTMLElement)) {
            return;
        }
        view.scrollIntoView({block: 'nearest', behavior: 'smooth'});
    };

    return {containerRef, trackScrollOffset: noop, scrollInputIntoView: noop, scrollToReveal};
};

export default useScrollToFocusedInput;
