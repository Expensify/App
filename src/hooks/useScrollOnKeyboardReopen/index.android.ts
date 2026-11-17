/** Restore the input's scroll position when Android reopens the keyboard without changing focus. */
import {useIsFocused} from '@react-navigation/native';
import {useEffect, useEffectEvent, useRef} from 'react';
import {AppState} from 'react-native';
import {KeyboardEvents} from 'react-native-keyboard-controller';

import type UseScrollOnKeyboardReopen from './types';

const useScrollOnKeyboardReopen: UseScrollOnKeyboardReopen = (ref, scrollToInput, isActive) => {
    const isScreenFocused = useIsFocused();
    const shouldScrollOnReopen = useRef(false);
    const shouldSkipNextHide = useRef(false);

    const resetScrollOnReopen = () => {
        shouldScrollOnReopen.current = false;
    };

    // Use the current callback without discarding a pending reopen when the form rerenders.
    const scrollToReopenedInput = useEffectEvent(() => {
        if (!isActive || !isScreenFocused || AppState.currentState !== 'active' || !ref.current?.isFocused()) {
            return;
        }
        scrollToInput();
    });

    useEffect(() => {
        if (!isActive || !isScreenFocused) {
            resetScrollOnReopen();
            return;
        }

        const appStateSubscription = AppState.addEventListener('change', (state) => {
            if (state === 'active') {
                return;
            }
            // Android can send the background hide again after the app returns to the foreground.
            shouldSkipNextHide.current = true;
            resetScrollOnReopen();
        });

        const hideSubscription = KeyboardEvents.addListener('keyboardDidHide', (event) => {
            // A partially completed dismissal can be cancelled without actually closing the keyboard.
            if (event.height !== 0) {
                return;
            }
            shouldScrollOnReopen.current = !shouldSkipNextHide.current && AppState.currentState === 'active' && !!ref.current?.isFocused();
            shouldSkipNextHide.current = false;
        });

        const showSubscription = KeyboardEvents.addListener('keyboardDidShow', (event) => {
            if (event.height <= 0) {
                return;
            }
            const shouldScroll = shouldScrollOnReopen.current;
            resetScrollOnReopen();
            shouldSkipNextHide.current = false;
            if (!shouldScroll) {
                return;
            }
            scrollToReopenedInput();
        });

        return () => {
            resetScrollOnReopen();
            appStateSubscription.remove();
            hideSubscription.remove();
            showSubscription.remove();
        };
    }, [isActive, isScreenFocused, ref, resetScrollOnReopen]);

    return resetScrollOnReopen;
};

export default useScrollOnKeyboardReopen;
