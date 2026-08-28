import setTextInputSelection from '@libs/focusComposerWithDelay/setTextInputSelection';

import {KeyboardController} from 'react-native-keyboard-controller';

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
        // The `isFocused()` guard in `focusComposerWithDelay` runs when this callback is *scheduled*, not when it runs.
        // By the time the idle callback fires the screen may be mid-dismiss (e.g. swiping back off the description step
        // and quickly tapping another field), leaving the input detached. Calling `setFocusTo('current')` then reloads
        // input views against a stale native first responder, which crashes on iOS. Re-check focus right before the
        // native call so it no-ops on the stale-responder path while still restoring the keyboard for a live input.
        if (!textInput || !('isFocused' in textInput) || !textInput.isFocused()) {
            return;
        }
        KeyboardController.setFocusTo('current');
        if (forcedSelectionRange) {
            setTextInputSelection(textInput, forcedSelectionRange);
        }
    });
};

export default requestKeyboardForFocusedComposer;
