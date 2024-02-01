import type {TextInput} from 'react-native';
import * as EmojiPickerAction from './actions/EmojiPickerAction';
import ComposerFocusManager from './ComposerFocusManager';
import isWindowReadyToFocus from './isWindowReadyToFocus';

type FocusComposerWithDelay = (shouldDelay?: boolean) => void;
/**
 * Create a function that focuses the composer.
 */
function focusComposerWithDelay(textInput: TextInput | null): FocusComposerWithDelay {
    /**
     * Focus the text input
     * @param [shouldDelay] Impose delay before focusing the text input
     */
    return (shouldDelay = false) => {
        // There could be other animations running while we trigger manual focus.
        // This prevents focus from making those animations janky.
        if (!textInput || EmojiPickerAction.isEmojiPickerVisible()) {
            return;
        }

        if (!shouldDelay) {
            textInput.focus();
            return;
        }
        ComposerFocusManager.isReadyToFocus()
            .then(isWindowReadyToFocus)
            .then(() => {
                if (!textInput) {
                    return;
                }
                textInput.focus();
            });
    };
}

export default focusComposerWithDelay;
