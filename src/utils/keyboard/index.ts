import {Keyboard} from 'react-native';
import TransitionTracker from '@libs/Navigation/TransitionTracker';
import type {DismissKeyboardOptions} from './types';

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
const dismiss = (options?: DismissKeyboardOptions): Promise<void> => {
    return new Promise((resolve) => {
        if (!isVisible) {
            resolve();

            return;
        }

        const subscription = Keyboard.addListener('keyboardDidHide', () => {
            resolve();
            TransitionTracker.endTransition();
            subscription.remove();
        });

        TransitionTracker.startTransition();
        Keyboard.dismiss();

        if (options?.afterTransition) {
            TransitionTracker.runAfterTransitions({callback: options.afterTransition});
        }
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
