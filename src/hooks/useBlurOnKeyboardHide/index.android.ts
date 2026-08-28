import {useEffect} from 'react';
import {KeyboardEvents} from 'react-native-keyboard-controller';

import type UseBlurOnKeyboardHide from './type';

/**
 * Android hides the soft keyboard on a back press/gesture without clearing focus from the native EditText,
 * so JS never receives onBlur and the input stays focused. Blur it explicitly once the keyboard is gone.
 */
const useBlurOnKeyboardHide: UseBlurOnKeyboardHide = (ref) => {
    useEffect(() => {
        const subscription = KeyboardEvents.addListener('keyboardDidHide', (event) => {
            // keyboardDidHide can fire mid-gesture with the keyboard still partly on screen. Only the zero-height
            // event means it is actually gone, so blurring on the earlier ones would break a cancelled swipe.
            if (event.height !== 0) {
                return;
            }
            ref.current?.blur();
        });
        return () => subscription.remove();
    }, [ref]);
};

export default useBlurOnKeyboardHide;
