import Log from '@libs/Log';
import CONST from '@src/CONST';
import type {FocusRestoreModule, InitialFocusParams} from './types';

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

const focusRestore: FocusRestoreModule = {
    getInitialFocusTarget: ({isOpenedViaKeyboard, containerElementRef}: InitialFocusParams) => {
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
    },
    restoreCapturedAnchorFocus: (capturedAnchorElement: HTMLElement | null): void => {
        if (!capturedAnchorElement || !document.body.contains(capturedAnchorElement)) {
            return;
        }

        capturedAnchorElement.focus();
    },
    shouldTryKeyboardInitialFocus: (isOpenedViaKeyboard: boolean): boolean => isOpenedViaKeyboard,
    isWebPlatform: (platform: string): boolean => platform === CONST.PLATFORM.WEB,
};

const {getInitialFocusTarget, restoreCapturedAnchorFocus, shouldTryKeyboardInitialFocus, isWebPlatform} = focusRestore;

export {getInitialFocusTarget, restoreCapturedAnchorFocus, shouldTryKeyboardInitialFocus, isWebPlatform};
