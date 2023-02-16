import {Keyboard} from 'react-native';
import * as Composer from '../actions/Composer';

export default (shouldShowComposeInput) => {
    this.keyboardDidHideListener = Keyboard.addListener(
        'keyboardDidHide',
        () => {
            Composer.setShouldShowComposeInput(shouldShowComposeInput);
        },
    );
};
