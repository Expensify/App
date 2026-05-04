import {Keyboard} from 'react-native';
// eslint-disable-next-line no-restricted-imports
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

const dismiss = (options?: DismissKeyboardOptions): Promise<void> => {
    return new Promise((resolve) => {
        if (!isVisible) {
            options?.afterTransition?.();
            resolve();

            return;
        }

        const transitionHandle = TransitionTracker.startTransition();
        const subscription = Keyboard.addListener('keyboardDidHide', () => {
            resolve();
            TransitionTracker.endTransition(transitionHandle);
            subscription.remove();
        });
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
