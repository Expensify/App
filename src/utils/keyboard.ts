import {InteractionManager, Keyboard} from 'react-native';
import getPlatform from '@libs/getPlatform';
import CONST from '@src/CONST';

let isNativeKeyboardVisible = false; // Native keyboard visibility
let isWebKeyboardOpen = false; // Web keyboard visibility
const isWeb = getPlatform() === CONST.PLATFORM.WEB;
/**
 * Initializes native keyboard visibility listeners
 */
const initializeNativeKeyboardListeners = () => {
    Keyboard.addListener('keyboardDidHide', () => {
        isNativeKeyboardVisible = false;
    });

    Keyboard.addListener('keyboardDidShow', () => {
        isNativeKeyboardVisible = true;
    });
};

/**
 * Checks if the given HTML element is a keyboard-related input
 */
const isKeyboardInput = (elem: HTMLElement): boolean =>
    (elem.tagName === 'INPUT' && !['button', 'submit', 'checkbox', 'file', 'image'].includes((elem as HTMLInputElement).type)) || elem.hasAttribute('contenteditable');

/**
 * Initializes web-specific keyboard visibility listeners
 */
const initializeWebKeyboardListeners = () => {
    if (typeof document === 'undefined' || !isWeb) {
        return;
    }

    const handleFocusIn = (e: FocusEvent) => {
        const target = e.target as HTMLElement;
        if (target && isKeyboardInput(target)) {
            isWebKeyboardOpen = true;
        }
    };

    const handleFocusOut = (e: FocusEvent) => {
        const target = e.target as HTMLElement;
        if (target && isKeyboardInput(target)) {
            isWebKeyboardOpen = false;
        }
    };

    document.addEventListener('focusin', handleFocusIn);
    document.addEventListener('focusout', handleFocusOut);
};

/**
 * Dismisses the keyboard and resolves the promise when the dismissal is complete
 */
const dismiss = (): Promise<void> => {
    return new Promise((resolve) => {
        if (isWeb) {
            if (!isWebKeyboardOpen) {
                resolve();
                return;
            }

            Keyboard.dismiss();
            InteractionManager.runAfterInteractions(() => {
                isWebKeyboardOpen = false;
                resolve();
            });

            return;
        }

        if (!isNativeKeyboardVisible) {
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

// Initialize listeners for native and web
initializeNativeKeyboardListeners();
initializeWebKeyboardListeners();

const utils = {dismiss};

export default utils;
