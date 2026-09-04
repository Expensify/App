import {useEffect, useRef} from 'react';
import {AppState} from 'react-native';
import {KeyboardController, KeyboardEvents} from 'react-native-keyboard-controller';

import type UseBlurOnKeyboardHide from './type';

/**
 * Android hides the soft keyboard on a back press/gesture without clearing focus from the native EditText,
 * so JS never receives onBlur and the input stays focused. Blur it explicitly once the keyboard is gone.
 */
const useBlurOnKeyboardHide: UseBlurOnKeyboardHide = (ref) => {
    const wasKeyboardShownForInputRef = useRef(false);

    useEffect(() => {
        let shouldSkipNextHide = false;

        const blurBecauseTheKeyboardIsGone = () => {
            wasKeyboardShownForInputRef.current = false;
            ref.current?.blur();
        };

        // Nothing listens while a covered screen is hidden, so a keyboard that went away in that window never reached
        // the input. Only an input this hook has already seen the keyboard open for is blurred here, which leaves a
        // first mount alone even when it puts the focus in the input straight away.
        if (wasKeyboardShownForInputRef.current && !KeyboardController.isVisible() && AppState.currentState === 'active') {
            blurBecauseTheKeyboardIsGone();
        }

        const appStateSubscription = AppState.addEventListener('change', (state) => {
            if (state === 'active') {
                return;
            }
            shouldSkipNextHide = true;
        });

        const showSubscription = KeyboardEvents.addListener('keyboardDidShow', () => {
            shouldSkipNextHide = false;
            wasKeyboardShownForInputRef.current = true;
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
            blurBecauseTheKeyboardIsGone();
        });

        return () => {
            appStateSubscription.remove();
            showSubscription.remove();
            hideSubscription.remove();
        };
    }, [ref]);
};

export default useBlurOnKeyboardHide;
