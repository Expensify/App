import ComposerFocusManager from '@libs/ComposerFocusManager';
import isWindowReadyToFocus from '@libs/isWindowReadyToFocus';
import * as EmojiPickerAction from '@userActions/EmojiPickerAction';
import CONST from '@src/CONST';
import setTextInputSelection from './setTextInputSelection';
import type {FocusComposerWithDelay, InputType} from './types';

/**
 * Create a function that focuses the composer.
 */
function focusComposerWithDelay(textInput: InputType | null, delay: number = CONST.COMPOSER_FOCUS_DELAY): FocusComposerWithDelay {
    /**
     * Focus the text input
     * @param [shouldDelay] Impose delay before focusing the text input
     * @param [forcedSelectionRange] Force selection range of text input
     */
    return (shouldDelay = false, forcedSelectionRange = undefined) => {
        // There could be other animations running while we trigger manual focus.
        // This prevents focus from making those animations janky.
        if (!textInput || EmojiPickerAction.isEmojiPickerVisible()) {
            return;
        }

        if (!shouldDelay) {
            textInput.focus();
            if (forcedSelectionRange) {
                setTextInputSelection(textInput, forcedSelectionRange);
            }
            return;
        }
        Promise.all([ComposerFocusManager.isReadyToFocus(), isWindowReadyToFocus()]).then(() => {
            if (!textInput) {
                return;
            }
            // When the closing modal has a focused text input focus() needs a delay to properly work.
            // Setting 150ms here is a temporary workaround for the Android HybridApp. It should be reverted once we identify the real root cause of this issue: https://github.com/Expensify/App/issues/56311.
            setTimeout(() => textInput.focus(), delay);
            if (forcedSelectionRange) {
                setTextInputSelection(textInput, forcedSelectionRange);
            }
        });
    };
}

export default focusComposerWithDelay;
