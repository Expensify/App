import {Keyboard} from 'react-native';
import * as Composer from '../actions/Composer';

let keyboardDidHideListener = null;
export default (shouldShow) => {
    if (keyboardDidHideListener) {
        keyboardDidHideListener.remove();
        keyboardDidHideListener = null;
    }

    if (!shouldShow || !Keyboard.isVisible()) {
        Composer.setShouldShowComposeInput(shouldShow);
        return;
    }

    keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
        Composer.setShouldShowComposeInput(true);
        keyboardDidHideListener.remove();
    });
};
