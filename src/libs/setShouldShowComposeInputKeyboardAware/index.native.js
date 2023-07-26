import {Keyboard} from 'react-native';
import * as Composer from '../actions/Composer';

let keyboardDidHideListener = null;
export default (shouldShow) => {
    if (keyboardDidHideListener) {
        keyboardDidHideListener.remove();
        keyboardDidHideListener = null;
    }

    if (!shouldShow) {
        Composer.setShouldShowComposeInput(false);
        return;
    }

    // If keyboard is already hidden, we should show composer immediately because keyboardDidHide event won't be called
    if (!Keyboard.isVisible()) {
        Composer.setShouldShowComposeInput(true);
        return;
    }

    keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
        Composer.setShouldShowComposeInput(true);
        keyboardDidHideListener.remove();
    });
};
