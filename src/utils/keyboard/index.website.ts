import {InteractionManager, Keyboard} from 'react-native';

let isVisible = false;

const isKeyboardInput = (elem: HTMLElement): boolean => {
    const inputTypesToIgnore = ['button', 'submit', 'checkbox', 'file', 'image'];
    return (elem.tagName === 'INPUT' && !inputTypesToIgnore.includes((elem as HTMLInputElement).type)) || elem.tagName === 'TEXTAREA' || elem.hasAttribute('contenteditable');
};

const handleFocusIn = (event: FocusEvent): void => {
    const target = event.target as HTMLElement;
    if (target && isKeyboardInput(target)) {
        isVisible = true;
    }
};

const handleFocusOut = (event: FocusEvent): void => {
    const target = event.target as HTMLElement;
    if (target && isKeyboardInput(target)) {
        isVisible = false;
    }
};

document.addEventListener('focusin', handleFocusIn);
document.addEventListener('focusout', handleFocusOut);

const dismiss = (): Promise<void> => {
    return new Promise((resolve) => {
        if (!isVisible) {
            resolve();
            return;
        }

        Keyboard.dismiss();
        InteractionManager.runAfterInteractions(() => {
            isVisible = false;
            resolve();
        });
    });
};

const utils = {
    dismiss,
};

export default utils;
