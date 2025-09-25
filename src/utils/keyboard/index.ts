import {Keyboard} from 'react-native';
import {KeyboardEvents} from 'react-native-keyboard-controller';

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
            resolve(undefined);
            subscription.remove();
        });

        Keyboard.dismiss();
    });
};

const executeAfterKeyboardDidHide = (cb: () => void): Promise<void> => {
    if (!isVisible) {
        cb();
    }
    return new Promise((resolve) => {
        const check = (e: {height: number}) => {
            if (e.height !== 0) {
                return;
            }
            cb();
            resolve();
            // eslint-disable-next-line @typescript-eslint/no-use-before-define
            test.remove();
        };

        const test = KeyboardEvents.addListener('keyboardDidHide', check);
        Keyboard.dismiss();
    });
};

const utils = {dismiss, executeAfterKeyboardDidHide};

export default utils;
