import {InteractionManager} from 'react-native';

/**
 * Create a function that focuses a text input.
 * @param {Object} textInput the text input to focus
 * @returns {Function} a function that focuses the text input with a configurable delay
 */

function createFocusFunction(textInput) {
    /**
     * Focus the text input
     * @param {Boolean} [shouldelay=false] Impose delay before focusing the text input
     */
    return function focus(shouldelay = false) {
        // There could be other animations running while we trigger manual focus.
        // This prevents focus from making those animations janky.
        InteractionManager.runAfterInteractions(() => {
            if (!textInput) {
                return;
            }

            if (!shouldelay) {
                textInput.focus();
            } else {
                // Keyboard is not opened after Emoji Picker is closed
                // SetTimeout is used as a workaround
                // https://github.com/react-native-modal/react-native-modal/issues/114
                // We carefully choose a delay. 100ms is found enough for keyboard to open.
                setTimeout(() => textInput.focus(), 100);
            }
        });
    };
}

export default createFocusFunction;
