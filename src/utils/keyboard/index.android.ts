import {Keyboard, Platform} from 'react-native';
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
        // This fixes a bug specific to Android < 16 (Platform.Version < 36)
        // https://github.com/Expensify/App/issues/70692
        if (!isVisible || Number(Platform.Version) >= 36) {
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

const utils = {dismiss, dismissKeyboardAndExecute};

export type {SimplifiedKeyboardEvent};
export default utils;
