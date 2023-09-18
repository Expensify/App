import {InteractionManager, TextInput} from 'react-native';
import ComposerFocusManager from './ComposerFocusManager';

type FocusWithDelay = (shouldDelay?: boolean) => void;
/**
 * Create a function that focuses a text input.
 */
function focusWithDelay(textInput: TextInput | null): FocusWithDelay {
    /**
     * Focus the text input
     * @param [shouldDelay] Impose delay before focusing the text input
     */
    return (shouldDelay = false) => {
        // There could be other animations running while we trigger manual focus.
        // This prevents focus from making those animations janky.
        InteractionManager.runAfterInteractions(() => {
            if (!textInput) {
                return;
            }

            if (!shouldDelay) {
                textInput.focus();
                return;
            }
            ComposerFocusManager.isReadyToFocus().then(() => {
                if (!textInput) {
                    return;
                }
                textInput.focus();
            });
        });
    };
}

export default focusWithDelay;
