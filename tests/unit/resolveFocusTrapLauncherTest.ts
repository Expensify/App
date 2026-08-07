import resolveFocusTrapLauncher from '../../src/libs/resolveFocusTrapLauncher';

describe('resolveFocusTrapLauncher', () => {
    afterEach(() => {
        document.body.innerHTML = '';
    });

    it('prefers the focused opener when the stack is empty', () => {
        const opener = document.createElement('button');
        document.body.appendChild(opener);
        expect(resolveFocusTrapLauncher(opener, null, document.createElement('div'), null)).toBe(opener);
    });

    it('falls back to pickLauncher when nothing is focused (ThreeDots pre-blur)', () => {
        const trigger = document.createElement('button');
        document.body.appendChild(trigger);
        expect(resolveFocusTrapLauncher(null, null, document.createElement('div'), trigger)).toBe(trigger);
    });

    it('keeps the registered trigger when focus is already inside the trap (nested PopoverMenu FocusTrap)', () => {
        const trigger = document.createElement('button');
        const container = document.createElement('div');
        const menuItem = document.createElement('button');
        document.body.appendChild(trigger);
        document.body.appendChild(container);
        container.appendChild(menuItem);

        expect(resolveFocusTrapLauncher(menuItem, trigger, container, trigger)).toBe(trigger);
    });

    it('still registers a nested-modal opener that sits outside this trap container', () => {
        const outerOpener = document.createElement('button');
        const innerOpener = document.createElement('button');
        const outerDialog = document.createElement('div');
        const innerTrapContainer = document.createElement('div');
        document.body.appendChild(outerOpener);
        document.body.appendChild(outerDialog);
        outerDialog.appendChild(innerOpener);
        document.body.appendChild(innerTrapContainer);

        // Inner modal trap activates while focus is still on the button inside the outer dialog (outside the new trap).
        expect(resolveFocusTrapLauncher(innerOpener, outerOpener, innerTrapContainer, outerOpener)).toBe(innerOpener);
    });
});
