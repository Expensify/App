import Log from '@libs/Log';
import CONST from '@src/CONST';

type InitialFocusParams = {
    isOpenedViaKeyboard: boolean;
    containerElementRef: unknown;
};

const DIALOG_SELECTOR = '[role="dialog"]';
const CONFIRM_MODAL_CONTAINER_SELECTOR = '[data-testid="confirm-modal-container"]';
const FIRST_BUTTON_SELECTOR = 'button';

function getHTMLElementFromUnknown(value: unknown): HTMLElement | null {
    return value instanceof HTMLElement ? value : null;
}

function findFirstButtonInLastDialog(): HTMLElement | false {
    const dialogs = document.querySelectorAll(DIALOG_SELECTOR);
    const lastDialog = dialogs[dialogs.length - 1];
    const firstButton = lastDialog?.querySelector(FIRST_BUTTON_SELECTOR);
    return firstButton instanceof HTMLElement ? firstButton : false;
}

function findFirstButtonInLastConfirmModalContainer(): HTMLElement | false {
    const containers = document.querySelectorAll(CONFIRM_MODAL_CONTAINER_SELECTOR);
    const lastContainer = containers[containers.length - 1];
    const firstButton = lastContainer?.querySelector(FIRST_BUTTON_SELECTOR);
    return firstButton instanceof HTMLElement ? firstButton : false;
}

function getInitialFocusTarget({isOpenedViaKeyboard, containerElementRef}: InitialFocusParams): HTMLElement | false {
    if (!isOpenedViaKeyboard) {
        return false;
    }

    const containerElement = getHTMLElementFromUnknown(containerElementRef);
    if (!containerElement) {
        const firstButtonInConfirmModal = findFirstButtonInLastConfirmModalContainer();
        if (firstButtonInConfirmModal) {
            return firstButtonInConfirmModal;
        }

        Log.warn('[ConfirmModal] modalContainerRef is null, falling back to last dialog');
        return findFirstButtonInLastDialog();
    }

    const firstButton = containerElement.querySelector(FIRST_BUTTON_SELECTOR);
    return firstButton instanceof HTMLElement ? firstButton : false;
}

function restoreCapturedAnchorFocus(capturedAnchorElement: HTMLElement | null): void {
    if (!capturedAnchorElement || !document.body.contains(capturedAnchorElement)) {
        return;
    }

    capturedAnchorElement.focus();
}

function shouldTryKeyboardInitialFocus(isOpenedViaKeyboard: boolean): boolean {
    return isOpenedViaKeyboard;
}

function isWebPlatform(platform: string): boolean {
    return platform === CONST.PLATFORM.WEB;
}

export {getInitialFocusTarget, restoreCapturedAnchorFocus, shouldTryKeyboardInitialFocus, isWebPlatform};
