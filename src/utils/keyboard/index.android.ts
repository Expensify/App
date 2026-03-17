import {Keyboard} from 'react-native';
import {KeyboardEvents} from 'react-native-keyboard-controller';

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
        if (!isVisible) {
            cb();
            resolve();
            return;
        }

        const keyboardDidHideSubscription = KeyboardEvents.addListener('keyboardDidHide', (e: SimplifiedKeyboardEvent) => {
            if (e.height !== 0) {
                resolve();
                return;
            }
            cb();
            keyboardDidHideSubscription.remove();
            resolve();
        });
        Keyboard.dismiss();
    });
};

const utils = {dismiss, dismissKeyboardAndExecute, subscribeKeyboardVisibilityChange};

export type {SimplifiedKeyboardEvent};
export default utils;
