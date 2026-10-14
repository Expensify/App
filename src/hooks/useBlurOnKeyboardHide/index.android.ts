import {useEffect} from 'react';
import {AppState, Dimensions} from 'react-native';
import {KeyboardEvents} from 'react-native-keyboard-controller';

import type UseBlurOnKeyboardHide from './type';

// Android tears the keyboard down without an animation when the device rotates and brings it back on its own.
// An instant hide waits this long for it before it is treated as a user dismissal.
const INSTANT_HIDE_BLUR_DELAY_MS = 300;

/**
 * Android hides the soft keyboard on a back press/gesture without clearing focus from the native EditText,
 * so JS never receives onBlur and the input stays focused. Blur it explicitly once the keyboard is gone.
 */
const useBlurOnKeyboardHide: UseBlurOnKeyboardHide = (ref) => {
    useEffect(() => {
        let shouldSkipNextHide = false;
        let pendingBlurTimeoutID: ReturnType<typeof setTimeout> | undefined;
        let lastWindowWidth = Dimensions.get('window').width;
        let lastWindowWidthChangeTime = 0;

        const cancelPendingBlur = () => {
            clearTimeout(pendingBlurTimeoutID);
            pendingBlurTimeoutID = undefined;
        };

        const appStateSubscription = AppState.addEventListener('change', (state) => {
            if (state === 'active') {
                return;
            }
            shouldSkipNextHide = true;
            cancelPendingBlur();
        });

        // Only width changes count, because the soft keyboard itself changes the window height on Android.
        const dimensionsSubscription = Dimensions.addEventListener('change', ({window}) => {
            if (window.width === lastWindowWidth) {
                return;
            }
            lastWindowWidth = window.width;
            lastWindowWidthChangeTime = Date.now();
            cancelPendingBlur();
        });

        // keyboardDidShow only fires once the show animation ends, which can be after the pending blur fires.
        const willShowSubscription = KeyboardEvents.addListener('keyboardWillShow', cancelPendingBlur);

        const showSubscription = KeyboardEvents.addListener('keyboardDidShow', () => {
            shouldSkipNextHide = false;
            cancelPendingBlur();
        });

        const hideSubscription = KeyboardEvents.addListener('keyboardDidHide', (event) => {
            // keyboardDidHide can fire mid-gesture with the keyboard still partly on screen. Only the zero-height
            // event means it is actually gone, so blurring on the earlier ones would break a cancelled swipe.
            if (event.height !== 0) {
                return;
            }

            // Skipping blur if event was emitted because app was backgrounded.
            const shouldSkip = shouldSkipNextHide || AppState.currentState !== 'active';
            shouldSkipNextHide = false;
            if (shouldSkip) {
                return;
            }

            if (event.duration !== 0) {
                ref.current?.blur();
                return;
            }

            // An instant hide is most likely a rotation, which must keep the input focused. The width change may
            // arrive on either side of the hide, so the one above skips the blur and this one cancels it.
            if (Date.now() - lastWindowWidthChangeTime < INSTANT_HIDE_BLUR_DELAY_MS) {
                return;
            }
            cancelPendingBlur();
            pendingBlurTimeoutID = setTimeout(() => {
                pendingBlurTimeoutID = undefined;
                ref.current?.blur();
            }, INSTANT_HIDE_BLUR_DELAY_MS);
        });

        return () => {
            cancelPendingBlur();
            appStateSubscription.remove();
            dimensionsSubscription.remove();
            willShowSubscription.remove();
            showSubscription.remove();
            hideSubscription.remove();
        };
    }, [ref]);
};

export default useBlurOnKeyboardHide;
