import {Keyboard} from 'react-native';

let isVirtualKeyboardOpen = false;

Keyboard.addListener(
    'keyboardDidShow',
    () => {
        isVirtualKeyboardOpen = true;
    },
);

Keyboard.addListener(
    'keyboardDidHide',
    () => {
        isVirtualKeyboardOpen = false;
    },
);

/**
 * Is the virtual keyboard open?
 *
 * Note – the web equivalent of this function may return null.
 *
 * @returns {Boolean}
 */
function isOpen() {
    return isVirtualKeyboardOpen;
}

export {
    // eslint-disable-next-line import/prefer-default-export
    isOpen,
};
