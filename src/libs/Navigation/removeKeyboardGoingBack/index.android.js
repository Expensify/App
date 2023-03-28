import {Keyboard} from 'react-native';

/**
 * @private
 */
export default function removeKeyboardGoingBack() {
    const isKeyboardVisible = Keyboard.isVisible();

    if (isKeyboardVisible) {
        Keyboard.dismiss();
    }
}
