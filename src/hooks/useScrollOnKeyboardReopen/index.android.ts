/** Restore the input's scroll position when Android reopens the keyboard without changing focus. */
import {useIsFocused} from '@react-navigation/native';
import {useEffect, useEffectEvent, useRef} from 'react';
import {AppState} from 'react-native';
import {KeyboardController, KeyboardEvents} from 'react-native-keyboard-controller';

import type UseScrollOnKeyboardReopen from './types';

const useScrollOnKeyboardReopen: UseScrollOnKeyboardReopen = (ref, scrollToInput, isActive) => {
    const isScreenFocused = useIsFocused();
    const shouldScrollOnReopen = useRef(false);

    const resetScrollOnReopen = () => {
        shouldScrollOnReopen.current = false;
    };

    // Use the current callback without discarding a pending reopen when the form rerenders.
    const scrollToReopenedInput = useEffectEvent((shouldDelayScroll: boolean) => {
        if (!shouldScrollOnReopen.current || !isActive || !isScreenFocused || AppState.currentState !== 'active' || !ref.current?.isFocused()) {
            return;
        }
        // A keyboard show can arrive before the app becomes active, so consume the scroll only when it can run.
        resetScrollOnReopen();
        scrollToInput(shouldDelayScroll);
    });

    useEffect(() => {
        if (!isActive || !isScreenFocused) {
            resetScrollOnReopen();
            return;
        }

        // Android can resend didShow without willShow, which is what updates the controller's visibility flag.
        let isKeyboardVisible = KeyboardController.isVisible();

        const appStateSubscription = AppState.addEventListener('change', (state) => {
            if (state === 'active') {
                // Android can retain the keyboard without sending another show event when the app returns.
                if (isKeyboardVisible || KeyboardController.isVisible()) {
                    // Controller visibility can become true at willShow, before the keyboard animation completes.
                    scrollToReopenedInput(true);
                }
                return;
            }
            // The form can lose its scroll offset in the background even though the input retains focus.
            shouldScrollOnReopen.current = !!ref.current?.isFocused();
        });

        const hideSubscription = KeyboardEvents.addListener('keyboardDidHide', (event) => {
            // A partially completed dismissal can be cancelled without actually closing the keyboard.
            if (event.height !== 0) {
                return;
            }
            isKeyboardVisible = false;
            shouldScrollOnReopen.current = !!ref.current?.isFocused();
        });

        const showSubscription = KeyboardEvents.addListener('keyboardDidShow', (event) => {
            if (event.height <= 0) {
                return;
            }
            isKeyboardVisible = true;
            scrollToReopenedInput(false);
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
