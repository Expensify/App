import useIsInLandscapeMode from '@hooks/useIsInLandscapeMode';
import useKeyboardState from '@hooks/useKeyboardState';

import {useEffect, useRef} from 'react';
import {Dimensions, TextInput} from 'react-native';
import {KeyboardEvents} from 'react-native-keyboard-controller';

import type {UseLandscapeOnBlurProxy} from './types';

// On rotation, KeyboardAvoidingView padding can briefly collapse an input's ancestor to zero size, which makes Android
// clear its focus. We re-focus after a short delay, once the layout has settled and the input has a size again.
const ROTATION_REFOCUS_DELAY_MS = 100;

// A blur counts as caused by a rotation when the window width changed this recently before it. The blur can also
// reach JS a few dozen milliseconds before the width change does, which the re-focus delay leaves room for.
const ROTATION_BLUR_WINDOW_MS = 500;

const useLandscapeOnBlurProxy: UseLandscapeOnBlurProxy = (inputRef, onBlur) => {
    const isInLandscapeMode = useIsInLandscapeMode();
    const {isKeyboardAnimatingRef, isKeyboardActive} = useKeyboardState();

    // The orientation is tracked outside of render, because the blur of a rotation lands before (or right around) the
    // re-render that would report the new orientation, so values read during render still describe the old one.
    const lastWindowWidthChangeTimeRef = useRef(0);
    const pendingRefocusTimeoutIDRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

    useEffect(() => {
        let lastWindowWidth = Dimensions.get('window').width;

        // Only width changes count, because the soft keyboard itself changes the window height on Android.
        const subscription = Dimensions.addEventListener('change', ({window}) => {
            if (window.width === lastWindowWidth) {
                return;
            }
            lastWindowWidth = window.width;
            lastWindowWidthChangeTimeRef.current = Date.now();
        });

        // keyboardWillHide is only emitted for animated hides. It is needed because Keyboard.dismiss() blurs the input
        // as the hide starts, and keyboardDidHide only arrives once the animation ends, after the re-focus delay.
        const keyboardWillHideSubscription = KeyboardEvents.addListener('keyboardWillHide', (event) => {
            if (event.duration === 0) {
                return;
            }
            lastWindowWidthChangeTimeRef.current = 0;
        });

        // Covers a rotation landing mid-hide-animation, so the Composer's blur on keyboardDidHide isn't taken as a rotation.
        const keyboardHideSubscription = KeyboardEvents.addListener('keyboardDidHide', (event) => {
            if (event.height !== 0 || event.duration === 0) {
                return;
            }
            lastWindowWidthChangeTimeRef.current = 0;
        });

        return () => {
            subscription.remove();
            keyboardWillHideSubscription.remove();
            keyboardHideSubscription.remove();
            clearTimeout(pendingRefocusTimeoutIDRef.current);
        };
    }, []);

    return (e) => {
        const isKeyboardOpening = isKeyboardAnimatingRef.current && isKeyboardActive;
        const blurTime = Date.now();

        clearTimeout(pendingRefocusTimeoutIDRef.current);
        pendingRefocusTimeoutIDRef.current = setTimeout(() => {
            pendingRefocusTimeoutIDRef.current = undefined;
            const isRotationBlur = lastWindowWidthChangeTimeRef.current > blurTime - ROTATION_BLUR_WINDOW_MS;
            if (!isRotationBlur && !(isKeyboardOpening && isInLandscapeMode)) {
                return;
            }

            // Focus that moved to another input on purpose (e.g. the user tapped it) must not be taken back.
            if (TextInput.State.currentlyFocusedInput()) {
                return;
            }

            inputRef.current?.focus?.();
        }, ROTATION_REFOCUS_DELAY_MS);

        onBlur?.(e);
    };
};

export default useLandscapeOnBlurProxy;
