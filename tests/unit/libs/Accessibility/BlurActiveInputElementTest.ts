import CONST from '@src/CONST';

/**
 * Web implementation of blurActiveInputElement, tested directly here because
 * jest-expo resolves platform imports to .native.ts (no-op) by default.
 * This mirrors src/libs/Accessibility/blurActiveInputElement/index.ts.
 */
function blurActiveInputElement(): void {
    const activeElement = document.activeElement;

    if (!(activeElement instanceof HTMLElement)) {
        return;
    }

    if (activeElement.tagName !== CONST.ELEMENT_NAME.INPUT && activeElement.tagName !== CONST.ELEMENT_NAME.TEXTAREA) {
        return;
    }

    activeElement.blur();
}

describe('blurActiveInputElement (web)', () => {
    afterEach(() => {
        document.body.innerHTML = '';
    });

    it('blurs the active element when it is an input', () => {
        const input = document.createElement('input');
        document.body.appendChild(input);
        input.focus();
        expect(document.activeElement).toBe(input);

        blurActiveInputElement();

        expect(document.activeElement).not.toBe(input);
    });

    it('blurs the active element when it is a textarea', () => {
        const textarea = document.createElement('textarea');
        document.body.appendChild(textarea);
        textarea.focus();
        expect(document.activeElement).toBe(textarea);

        blurActiveInputElement();

        expect(document.activeElement).not.toBe(textarea);
    });

    it('does nothing when the active element is not an input or textarea', () => {
        const button = document.createElement('button');
        document.body.appendChild(button);
        button.focus();
        expect(document.activeElement).toBe(button);

        blurActiveInputElement();

        expect(document.activeElement).toBe(button);
    });
});
