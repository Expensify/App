import type {MeasurableInput} from '@components/SelectionList/SelectionListWithSections/types';

import CONST from '@src/CONST';

import type {ComponentRef} from 'react';
import type {EmitterSubscription, NativeScrollEvent, NativeSyntheticEvent, View} from 'react-native';

import {useCallback, useEffect, useRef} from 'react';
import {KeyboardEvents} from 'react-native-keyboard-controller';

import type {ScrollInputIntoViewOptions, UseScrollToFocusedInput} from './types';

import scrollInputToAnchor from './scrollInputToAnchor';

/**
 * Scrolls a `FlashList` so that an input rendered inside its footer is not hidden behind the keyboard.
 *
 * `BaseSelectionList` scrolls *list items* into view via `scrollToIndex`, but footer inputs aren't list items,
 * so we instead pull the focused input up toward the top of the list area once the keyboard is shown.
 */
const useScrollToFocusedInput: UseScrollToFocusedInput = (listRef, isKeyboardShown) => {
    const containerRef = useRef<ComponentRef<typeof View> | null>(null);
    const scrollOffsetRef = useRef(0);
    const isKeyboardShownRef = useRef(isKeyboardShown);
    const keyboardListenerRef = useRef<EmitterSubscription | null>(null);
    const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        isKeyboardShownRef.current = isKeyboardShown;
    }, [isKeyboardShown]);

    const cleanup = useCallback(() => {
        keyboardListenerRef.current?.remove();
        keyboardListenerRef.current = null;
        if (!scrollTimeoutRef.current) {
            return;
        }
        clearTimeout(scrollTimeoutRef.current);
        scrollTimeoutRef.current = null;
    }, []);

    useEffect(() => cleanup, [cleanup]);

    const trackScrollOffset = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
        scrollOffsetRef.current = event.nativeEvent.contentOffset.y;
    }, []);

    const scrollInputIntoView = useCallback(
        (input: MeasurableInput, options: ScrollInputIntoViewOptions = {}) => {
            const performScroll = () => scrollInputToAnchor({...options, input, containerRef, listRef, getCurrentOffset: () => scrollOffsetRef.current});

            cleanup();

            if (options.shouldScrollImmediately) {
                performScroll();
                return;
            }

            // The keyboard is already up (e.g. moving focus between fields), so the layout is settled — scroll right away.
            if (isKeyboardShownRef.current) {
                scrollTimeoutRef.current = setTimeout(performScroll, CONST.ANIMATION_IN_TIMING);
                return;
            }

            // Otherwise wait for the keyboard to appear before measuring. We use react-native-keyboard-controller's
            // `keyboardDidShow` (the same source as `withKeyboardState`) rather than RN's `Keyboard`, because RN's
            // `keyboardDidShow` does not fire on Android 10 and below under `adjustResize`, which would leave the
            // focused field hidden until the safety timeout below.
            keyboardListenerRef.current = KeyboardEvents.addListener('keyboardDidShow', () => {
                cleanup();
                // Give the layout a moment to settle after the keyboard has fully appeared.
                scrollTimeoutRef.current = setTimeout(performScroll, CONST.ANIMATION_IN_TIMING);
            });

            // Safety net in case the keyboard event never fires; long enough that the listener wins under normal conditions.
            scrollTimeoutRef.current = setTimeout(() => {
                cleanup();
                performScroll();
            }, CONST.MAX_TRANSITION_DURATION_MS);
        },
        [cleanup, listRef],
    );

    return {containerRef, trackScrollOffset, scrollInputIntoView};
};

export default useScrollToFocusedInput;
