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

export default {
    shouldAssumeIsOpen: () => isVirtualKeyboardOpen,
};
