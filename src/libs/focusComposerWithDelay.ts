import {Platform, TextInput} from 'react-native';
import CONST from '@src/CONST';
import * as EmojiPickerAction from './actions/EmojiPickerAction';
import ComposerFocusManager from './ComposerFocusManager';

type Selection = {
    start: number;
    end: number;
};

type FocusComposerWithDelay = (shouldDelay?: boolean) => void;
/**
 * Create a function that focuses the composer.
 */
function focusComposerWithDelay(textInput: TextInput | HTMLTextAreaElement | null): FocusComposerWithDelay {
    /**
     * Focus the text input
     * @param [shouldDelay] Impose delay before focusing the text input
     */
    return (shouldDelay = false, forceSetSelection?: Selection) => {
        // There could be other animations running while we trigger manual focus.
        // This prevents focus from making those animations janky.
        if (!textInput || EmojiPickerAction.isEmojiPickerVisible()) {
            return;
        }

        if (!shouldDelay) {
            textInput.focus();
            if (forceSetSelection) {
                if (Platform.OS === CONST.PLATFORM.WEB) {
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
                if (Platform.OS === CONST.PLATFORM.WEB) {
                    (textInput as HTMLTextAreaElement).setSelectionRange(forceSetSelection.start, forceSetSelection.end);
                } else {
                    (textInput as TextInput).setSelection(forceSetSelection.start, forceSetSelection.end);
                }
            }
        });
    };
}

export default focusComposerWithDelay;
