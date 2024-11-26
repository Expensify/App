import {KeyboardController, KeyboardEvents} from 'react-native-keyboard-controller';

let isVisible = false;

KeyboardEvents.addListener('keyboardDidHide', () => {
    isVisible = false;
});

KeyboardEvents.addListener('keyboardDidShow', () => {
    isVisible = true;
});

// starting from react-native-keyboard-controller@1.15+ we can use `KeyboardController.dismiss()` directly
const dismiss = (): Promise<void> => {
    return new Promise((resolve) => {
        if (!isVisible) {
            resolve();

            return;
        }

        const subscription = KeyboardEvents.addListener('keyboardDidHide', () => {
            resolve(undefined);
            subscription.remove();
        });

        KeyboardController.dismiss();
    });
};

const utils = {dismiss};

export default utils;
