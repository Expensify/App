import type {View} from 'react-native';

import {useRef} from 'react';

import type {UseScrollToFocusedInput} from './types';

const noop = () => {};

/**
 * No-op on web: browsers automatically scroll a focused input into view, so there's nothing to do here.
 * `containerRef` is still returned so the list can attach it harmlessly.
 */
const useScrollToFocusedInput: UseScrollToFocusedInput = () => {
    const containerRef = useRef<View | null>(null);
    return {containerRef, trackScrollOffset: noop, scrollInputIntoView: noop};
};

export default useScrollToFocusedInput;
