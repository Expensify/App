import {getInitialFocusTarget, isWebPlatform, restoreCapturedAnchorFocus, shouldTryKeyboardInitialFocus} from '@components/ConfirmModal/focusRestore/index.web';
import CONST from '@src/CONST';

describe('ConfirmModal focusRestore (web)', () => {
    afterEach(() => {
        document.body.innerHTML = '';
        jest.clearAllMocks();
    });

    it('should skip initial focus for mouse/touch opens', () => {
        const container = document.createElement('div');
        document.body.appendChild(container);

        const result = getInitialFocusTarget({
            isOpenedViaKeyboard: false,
            containerElementRef: container,
        });

        expect(result).toBe(false);
    });

    it('should focus the first button in the scoped container for keyboard opens', () => {
        const container = document.createElement('div');
        const button = document.createElement('button');
        button.textContent = 'Confirm';
        container.appendChild(button);
        document.body.appendChild(container);

        const result = getInitialFocusTarget({
            isOpenedViaKeyboard: true,
            containerElementRef: container,
        });

        expect(result).toBe(button);
    });

    it('should prefer last confirm-modal container fallback when container ref is unavailable', () => {
        const confirmModalContainerA = document.createElement('div');
        confirmModalContainerA.setAttribute('data-testid', 'confirm-modal-container');
        const containerButtonA = document.createElement('button');
        containerButtonA.textContent = 'Container A';
        confirmModalContainerA.appendChild(containerButtonA);

        const confirmModalContainerB = document.createElement('div');
        confirmModalContainerB.setAttribute('data-testid', 'confirm-modal-container');
        const containerButtonB = document.createElement('button');
        containerButtonB.textContent = 'Container B';
        confirmModalContainerB.appendChild(containerButtonB);

        const dialog = document.createElement('div');
        dialog.setAttribute('role', 'dialog');
        const dialogButton = document.createElement('button');
        dialogButton.textContent = 'Dialog Button';
        dialog.appendChild(dialogButton);

        document.body.appendChild(confirmModalContainerA);
        document.body.appendChild(dialog);
        document.body.appendChild(confirmModalContainerB);

        const result = getInitialFocusTarget({
            isOpenedViaKeyboard: true,
            containerElementRef: null,
        });

        expect(result).toBe(containerButtonB);
    });

    it('should fall back to the last dialog if no confirm-modal container is available', () => {
        const dialogA = document.createElement('div');
        dialogA.setAttribute('role', 'dialog');
        const buttonA = document.createElement('button');
        dialogA.appendChild(buttonA);

        const dialogB = document.createElement('div');
        dialogB.setAttribute('role', 'dialog');
        const buttonB = document.createElement('button');
        dialogB.appendChild(buttonB);

        document.body.appendChild(dialogA);
        document.body.appendChild(dialogB);

        const result = getInitialFocusTarget({
            isOpenedViaKeyboard: true,
            containerElementRef: null,
        });

        expect(result).toBe(buttonB);
    });

    it('should restore focus to captured anchor when it is still in DOM', () => {
        const anchor = document.createElement('button');
        document.body.appendChild(anchor);
        const focusSpy = jest.spyOn(anchor, 'focus');

        restoreCapturedAnchorFocus(anchor);

        expect(focusSpy).toHaveBeenCalledTimes(1);
    });

    it('should expose expected platform helpers', () => {
        expect(shouldTryKeyboardInitialFocus(true)).toBe(true);
        expect(shouldTryKeyboardInitialFocus(false)).toBe(false);
        expect(isWebPlatform(CONST.PLATFORM.WEB)).toBe(true);
        expect(isWebPlatform(CONST.PLATFORM.ANDROID)).toBe(false);
    });
});
