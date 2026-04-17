import {KeyboardController} from 'react-native-keyboard-controller';
import ComposerFocusManager from '@libs/ComposerFocusManager';
import getPlatform from '@libs/getPlatform';
import isWindowReadyToFocus from '@libs/isWindowReadyToFocus';
import * as EmojiPickerAction from '@userActions/EmojiPickerAction';
import CONST from '@src/CONST';
import setTextInputSelection from './setTextInputSelection';
import type {FocusComposerWithDelay, InputType, Selection} from './types';

/**
 * When the field already has focus, RN's `focus()` often does not show the IME again.
 * `KeyboardController.setFocusTo('current')` re-applies focus via native (`requestFocusFromJS` on Android,
 * `reloadInputViews` + `focus` on iOS) without blurring first.
 *
 * @see https://kirillzyusko.github.io/react-native-keyboard-controller/docs/api/keyboard-controller#setfocusto
 */
function requestKeyboardForFocusedComposer(textInput: InputType, forcedSelectionRange?: Selection) {
    const platform = getPlatform();
    const isNative = platform === CONST.PLATFORM.IOS || platform === CONST.PLATFORM.ANDROID;

    if (!isNative) {
        return;
    }

    requestIdleCallback(() => {
        KeyboardController.setFocusTo('current');
        if (forcedSelectionRange) {
            setTextInputSelection(textInput, forcedSelectionRange);
        }
    });
}

/**
 * Create a function that focuses the composer.
 */
function focusComposerWithDelay(textInput: InputType | null, delay: number = CONST.COMPOSER_FOCUS_DELAY): FocusComposerWithDelay {
    function getIsFocused() {
        if (textInput && 'isFocused' in textInput) {
            return textInput.isFocused();
        }
        return false;
    }

    /**
     * Focus the text input
     * @param [shouldDelay] Impose delay before focusing the text input
     * @param [forcedSelectionRange] Force selection range of text input
     * @param [forceKeyboardIfAlreadyFocused] Use KeyboardController so the soft keyboard can show without blur/refocus
     */
    return async (shouldDelay = false, forcedSelectionRange = undefined, forceKeyboardIfAlreadyFocused = false) => {
        // There could be other animations running while we trigger manual focus.
        // This prevents focus from making those animations janky.
        if (!textInput || EmojiPickerAction.isEmojiPickerVisible()) {
            return;
        }

        if (!shouldDelay) {
            if (getIsFocused()) {
                if (forceKeyboardIfAlreadyFocused) {
                    requestKeyboardForFocusedComposer(textInput, forcedSelectionRange);
                }
                return;
            }

            textInput.focus();
            if (forcedSelectionRange) {
                setTextInputSelection(textInput, forcedSelectionRange);
            }
            return;
        }

        await Promise.all([ComposerFocusManager.isReadyToFocus(), isWindowReadyToFocus()]);

        if (!textInput) {
            return;
        }
        // When the closing modal has a focused text input focus() needs a delay to properly work.
        // Setting 150ms here is a temporary workaround for the Android HybridApp. It should be reverted once we identify the real root cause of this issue: https://github.com/Expensify/App/issues/56311.
        setTimeout(() => {
            if (getIsFocused()) {
                if (forceKeyboardIfAlreadyFocused) {
                    // Selection is applied synchronously below; only request focus
                    requestKeyboardForFocusedComposer(textInput);
                }
                return;
            }
            textInput.focus();
        }, delay);
        if (forcedSelectionRange) {
            setTextInputSelection(textInput, forcedSelectionRange);
        }
    };
}

export default focusComposerWithDelay;
