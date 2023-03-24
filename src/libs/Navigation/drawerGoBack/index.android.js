import {Keyboard} from 'react-native';
import Navigation from '../Navigation';

/**
 * @private
 * @param {string} backRoute
 */
export default function drawerGoBack(backRoute) {
    const isKeyboardVisible = Keyboard.isVisible();

    if (isKeyboardVisible) {
        Keyboard.dismiss();
    }
    if (!backRoute) {
        Navigation.goBack();
        return;
    }
    Navigation.navigate(backRoute);
}
