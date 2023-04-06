import {Keyboard} from 'react-native';

/**
 * @private
 */
export default function dismissKeyboardGoingBack() {
    const isKeyboardVisible = Keyboard.isVisible();

    if (isKeyboardVisible) {
        Keyboard.dismiss();
    }
}
