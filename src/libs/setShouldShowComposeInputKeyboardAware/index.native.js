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

    if (!Keyboard.isVisible()) {
        Composer.setShouldShowComposeInput(true);
        return;
    }

    keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
        Composer.setShouldShowComposeInput(true);
        keyboardDidHideListener.remove();
    });
};
