import {Keyboard} from 'react-native';

type SimplifiedKeyboardEvent = {
    height?: number;
};

let isVisible = false;

Keyboard.addListener('keyboardDidHide', () => {
    isVisible = false;
});

Keyboard.addListener('keyboardDidShow', () => {
    isVisible = true;
});

const dismiss = (): Promise<void> => {
    return new Promise((resolve) => {
        if (!isVisible) {
            resolve();

            return;
        }

        const subscription = Keyboard.addListener('keyboardDidHide', () => {
            resolve();
            subscription.remove();
        });

        Keyboard.dismiss();
    });
};

const dismissKeyboardAndExecute = (cb: () => void): Promise<void> => {
    return new Promise((resolve) => {
        // For iOS and other platforms, execute callback immediately
        cb();
        resolve();
    });
};

const utils = {dismiss, dismissKeyboardAndExecute};

export type {SimplifiedKeyboardEvent};
export default utils;
