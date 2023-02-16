import {Keyboard} from 'react-native';
import * as Composer from '../actions/Composer';

export default (shouldShowComposeInput) => {
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
        Composer.setShouldShowComposeInput(shouldShowComposeInput);
        keyboardDidHideListener.remove();
    });
};
