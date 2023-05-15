import {Keyboard} from 'react-native';
import * as Composer from '../actions/Composer';

export default () => {
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
        Composer.setShouldShowComposeInput(true);
        keyboardDidHideListener.remove();
    });
};
