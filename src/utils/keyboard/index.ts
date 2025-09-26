import {Keyboard} from 'react-native';
import {KeyboardEvents} from 'react-native-keyboard-controller';
import getPlatform from '@libs/getPlatform';
import CONST from '@src/CONST';

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

const dismissKeyboardAndExecute = (cb: () => void): Promise<void> => {
    return new Promise((resolve) => {
        // This fixes a bug specific to a Android < 16 
        // https://github.com/Expensify/App/issues/70692
        if (!isVisible || getPlatform() !== CONST.PLATFORM.ANDROID) {
            cb();
            resolve();
            return;
        }

        const keyboardDidHideSubscription = KeyboardEvents.addListener('keyboardDidHide', (e: {height: number; target: number}) => {
            if (e.height !== 0) {
                return;
            }
            cb();
            resolve();
            keyboardDidHideSubscription.remove();
        });
        Keyboard.dismiss();
    });
};

const utils = {dismiss, dismissKeyboardAndExecute};

export default utils;
