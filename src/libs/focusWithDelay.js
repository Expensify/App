import {InteractionManager} from 'react-native';
import ComposerFocusManager from './ComposerFocusManager';

/**
 * Create a function that focuses a text input.
 * @param {Object} textInput the text input to focus
 * @returns {Function} a function that focuses the text input with a configurable delay
 */
function focusWithDelay(textInput) {
    /**
     * Focus the text input
     * @param {Boolean} [shouldDelay=false] Impose delay before focusing the text input
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
