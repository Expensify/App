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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const subscribeKeyboardVisibilityChange = (cb: (isVisible: boolean) => void) => {
    return () => {};
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const dismiss = (shouldSkipSafari?: boolean): Promise<void> => {
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

const utils = {dismiss, dismissKeyboardAndExecute, subscribeKeyboardVisibilityChange};

export type {SimplifiedKeyboardEvent};
export default utils;
