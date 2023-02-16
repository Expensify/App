import {Keyboard} from 'react-native';
import * as Composer from '../actions/Composer';

export default (shouldShowComposeInput, isSmallScreenWidth = true) => {
    if (!isSmallScreenWidth) {
        return;
    }
    this.keyboardDidHideListener = Keyboard.addListener(
        'keyboardDidHide',
        () => {
            Composer.setShouldShowComposeInput(shouldShowComposeInput);
        },
    );
};
