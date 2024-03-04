import type {TextInput} from 'react-native';
import ComposerFocusManager from '@libs/ComposerFocusManager';
import shouldSetSelectionRange from '@libs/shouldSetSelectionRange';
import * as EmojiPickerAction from '@userActions/EmojiPickerAction';
import type {FocusComposerWithDelay} from './types';

const setSelectionRange = shouldSetSelectionRange();

/**
 * Create a function that focuses the composer.
 */
function focusComposerWithDelay(textInput: TextInput | HTMLTextAreaElement | null): FocusComposerWithDelay {
    /**
     * Focus the text input
     * @param [shouldDelay] Impose delay before focusing the text input
     * @param [forceSetSelection] Force selection range of text input
     */
    return (shouldDelay = false, forceSetSelection = undefined) => {
        // There could be other animations running while we trigger manual focus.
        // This prevents focus from making those animations janky.
        if (!textInput || EmojiPickerAction.isEmojiPickerVisible()) {
            return;
        }

        if (!shouldDelay) {
            textInput.focus();
            if (forceSetSelection) {
                if (setSelectionRange) {
                    (textInput as HTMLTextAreaElement).setSelectionRange(forceSetSelection.start, forceSetSelection.end);
                } else {
                    (textInput as TextInput).setSelection(forceSetSelection.start, forceSetSelection.end);
                }
            }
            return;
        }
        ComposerFocusManager.isReadyToFocus().then(() => {
            if (!textInput) {
                return;
            }
            textInput.focus();
            if (forceSetSelection) {
                if (setSelectionRange) {
                    (textInput as HTMLTextAreaElement).setSelectionRange(forceSetSelection.start, forceSetSelection.end);
                } else {
                    (textInput as TextInput).setSelection(forceSetSelection.start, forceSetSelection.end);
                }
            }
        });
    };
}

export default focusComposerWithDelay;
