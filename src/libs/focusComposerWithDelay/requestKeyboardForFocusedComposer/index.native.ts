import {KeyboardController} from 'react-native-keyboard-controller';
import setTextInputSelection from '@libs/focusComposerWithDelay/setTextInputSelection';
import type RequestKeyboardForFocusedComposer from './types';

/**
 * When the field already has focus, RN's `focus()` often does not show the IME again.
 * `KeyboardController.setFocusTo('current')` re-applies focus via native (`requestFocusFromJS` on Android,
 * `reloadInputViews` + `focus` on iOS) without blurring first.
 *
 * @see https://kirillzyusko.github.io/react-native-keyboard-controller/docs/api/keyboard-controller#setfocusto
 */
const requestKeyboardForFocusedComposer: RequestKeyboardForFocusedComposer = (textInput, forcedSelectionRange) => {
    requestIdleCallback(() => {
        KeyboardController.setFocusTo('current');
        if (forcedSelectionRange) {
            setTextInputSelection(textInput, forcedSelectionRange);
        }
    });
};

export default requestKeyboardForFocusedComposer;
