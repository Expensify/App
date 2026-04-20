/**
 * Tests for focusFirstInteractiveElement — the pure DOM logic extracted
 * from useDialogContainerFocus (web). Tests run in jsdom without needing
 * React hooks, InteractionManager, or requestAnimationFrame mocks.
 */

// Import the web implementation directly (Jest resolves index.native.ts by default).
/* eslint-disable @typescript-eslint/no-require-imports, import/extensions */
const {focusFirstInteractiveElement} = require<{
    focusFirstInteractiveElement: (container: HTMLElement | null) => boolean;
}>('../../src/hooks/useDialogContainerFocus/index.ts');
/* eslint-enable @typescript-eslint/no-require-imports, import/extensions */

function createContainer(...children: HTMLElement[]) {
    const container = document.createElement('div');
    for (const child of children) {
        container.appendChild(child);
    }
    document.body.appendChild(container);
    return container;
}

function simulateTab() {
    document.dispatchEvent(new KeyboardEvent('keydown', {key: 'Tab', bubbles: true}));
}

function simulateTyping() {
    document.dispatchEvent(new KeyboardEvent('keydown', {key: '1', bubbles: true}));
}

function simulateMouse() {
    document.dispatchEvent(new MouseEvent('mousedown', {bubbles: true}));
}

function simulateEnter() {
    document.dispatchEvent(new KeyboardEvent('keydown', {key: 'Enter', bubbles: true}));
}

function simulateSpace() {
    document.dispatchEvent(new KeyboardEvent('keydown', {key: ' ', bubbles: true}));
}

afterEach(() => {
    document.body.innerHTML = '';
});

describe('focusFirstInteractiveElement', () => {
    describe('when Tab was used (should focus)', () => {
        beforeEach(() => {
            simulateTab();
        });

        it('should focus the first button with focusVisible: true', () => {
            const button = document.createElement('button');
            const container = createContainer(button);
            const spy = jest.spyOn(button, 'focus');

            expect(focusFirstInteractiveElement(container)).toBe(true);
            expect(spy).toHaveBeenCalledWith({preventScroll: true, focusVisible: true});
        });

        it('should focus after Tab → Enter', () => {
            simulateEnter();
            const button = document.createElement('button');
            const container = createContainer(button);
            const spy = jest.spyOn(button, 'focus');

            expect(focusFirstInteractiveElement(container)).toBe(true);
            expect(spy).toHaveBeenCalledWith({preventScroll: true, focusVisible: true});
        });

        it('should focus after Tab → Space', () => {
            simulateSpace();
            const button = document.createElement('button');
            const container = createContainer(button);
            const spy = jest.spyOn(button, 'focus');

            expect(focusFirstInteractiveElement(container)).toBe(true);
            expect(spy).toHaveBeenCalledWith({preventScroll: true, focusVisible: true});
        });

        it('should not focus when container is null', () => {
            expect(focusFirstInteractiveElement(null)).toBe(false);
        });

        it('should not focus when another element already has focus', () => {
            const input = document.createElement('input');
            document.body.appendChild(input);
            input.focus();
            const button = document.createElement('button');
            const container = createContainer(button);
            const spy = jest.spyOn(button, 'focus');

            expect(focusFirstInteractiveElement(container)).toBe(false);
            expect(spy).not.toHaveBeenCalled();
        });

        it('should not focus when container has no focusable elements', () => {
            const container = createContainer(document.createElement('div'));

            expect(focusFirstInteractiveElement(container)).toBe(false);
        });
    });

    describe('when Tab was NOT used (should skip focus)', () => {
        it('should skip after typing', () => {
            simulateTab();
            simulateTyping();
            const button = document.createElement('button');
            const container = createContainer(button);
            const spy = jest.spyOn(button, 'focus');

            expect(focusFirstInteractiveElement(container)).toBe(false);
            expect(spy).not.toHaveBeenCalled();
        });

        it('should skip after typing → Enter', () => {
            simulateTab();
            simulateTyping();
            simulateEnter();
            const button = document.createElement('button');
            const container = createContainer(button);
            const spy = jest.spyOn(button, 'focus');

            expect(focusFirstInteractiveElement(container)).toBe(false);
            expect(spy).not.toHaveBeenCalled();
        });

        it('should skip after mousedown', () => {
            simulateTab();
            simulateMouse();
            const button = document.createElement('button');
            const container = createContainer(button);
            const spy = jest.spyOn(button, 'focus');

            expect(focusFirstInteractiveElement(container)).toBe(false);
            expect(spy).not.toHaveBeenCalled();
        });

        it('should skip on page load (no interaction)', () => {
            simulateMouse();
            const button = document.createElement('button');
            const container = createContainer(button);
            const spy = jest.spyOn(button, 'focus');

            expect(focusFirstInteractiveElement(container)).toBe(false);
            expect(spy).not.toHaveBeenCalled();
        });
    });

    describe('element filtering', () => {
        beforeEach(() => {
            simulateTab();
        });

        it('should skip elements inside aria-hidden containers', () => {
            const hiddenDiv = document.createElement('div');
            hiddenDiv.setAttribute('aria-hidden', 'true');
            const hiddenButton = document.createElement('button');
            hiddenDiv.appendChild(hiddenButton);
            const visibleButton = document.createElement('button');
            const container = createContainer(hiddenDiv, visibleButton);
            const hiddenSpy = jest.spyOn(hiddenButton, 'focus');
            const visibleSpy = jest.spyOn(visibleButton, 'focus');

            focusFirstInteractiveElement(container);
            expect(hiddenSpy).not.toHaveBeenCalled();
            expect(visibleSpy).toHaveBeenCalled();
        });

        it('should return false when all elements are aria-hidden', () => {
            const hiddenDiv = document.createElement('div');
            hiddenDiv.setAttribute('aria-hidden', 'true');
            hiddenDiv.appendChild(document.createElement('button'));
            const container = createContainer(hiddenDiv);

            expect(focusFirstInteractiveElement(container)).toBe(false);
        });

        it('should skip disabled elements', () => {
            const disabledButton = document.createElement('button');
            disabledButton.disabled = true;
            const enabledButton = document.createElement('button');
            const container = createContainer(disabledButton, enabledButton);
            const disabledSpy = jest.spyOn(disabledButton, 'focus');
            const enabledSpy = jest.spyOn(enabledButton, 'focus');

            focusFirstInteractiveElement(container);
            expect(disabledSpy).not.toHaveBeenCalled();
            expect(enabledSpy).toHaveBeenCalled();
        });

        it('should skip elements with aria-disabled="true"', () => {
            const ariaDisabledButton = document.createElement('button');
            ariaDisabledButton.setAttribute('aria-disabled', 'true');
            const enabledButton = document.createElement('button');
            const container = createContainer(ariaDisabledButton, enabledButton);
            const disabledSpy = jest.spyOn(ariaDisabledButton, 'focus');
            const enabledSpy = jest.spyOn(enabledButton, 'focus');

            focusFirstInteractiveElement(container);
            expect(disabledSpy).not.toHaveBeenCalled();
            expect(enabledSpy).toHaveBeenCalled();
        });

        it('should skip elements with tabindex="-1"', () => {
            const skipDiv = document.createElement('div');
            skipDiv.setAttribute('tabindex', '-1');
            const button = document.createElement('button');
            const container = createContainer(skipDiv, button);
            const skipSpy = jest.spyOn(skipDiv, 'focus');
            const buttonSpy = jest.spyOn(button, 'focus');

            focusFirstInteractiveElement(container);
            expect(skipSpy).not.toHaveBeenCalled();
            expect(buttonSpy).toHaveBeenCalled();
        });
    });

    describe('selector coverage', () => {
        beforeEach(() => {
            simulateTab();
        });

        it('should find button', () => {
            const el = document.createElement('button');
            const spy = jest.spyOn(el, 'focus');
            focusFirstInteractiveElement(createContainer(el));
            expect(spy).toHaveBeenCalled();
        });

        it('should find link (a[href])', () => {
            const el = document.createElement('a');
            el.setAttribute('href', '#');
            const spy = jest.spyOn(el, 'focus');
            focusFirstInteractiveElement(createContainer(el));
            expect(spy).toHaveBeenCalled();
        });

        it('should find input', () => {
            const el = document.createElement('input');
            const spy = jest.spyOn(el, 'focus');
            focusFirstInteractiveElement(createContainer(el));
            expect(spy).toHaveBeenCalled();
        });

        it('should find textarea', () => {
            const el = document.createElement('textarea');
            const spy = jest.spyOn(el, 'focus');
            focusFirstInteractiveElement(createContainer(el));
            expect(spy).toHaveBeenCalled();
        });

        it('should find select', () => {
            const el = document.createElement('select');
            const spy = jest.spyOn(el, 'focus');
            focusFirstInteractiveElement(createContainer(el));
            expect(spy).toHaveBeenCalled();
        });

        it('should find [role="button"]', () => {
            const el = document.createElement('div');
            el.setAttribute('role', 'button');
            el.setAttribute('tabindex', '0');
            const spy = jest.spyOn(el, 'focus');
            focusFirstInteractiveElement(createContainer(el));
            expect(spy).toHaveBeenCalled();
        });

        it('should find [role="link"]', () => {
            const el = document.createElement('div');
            el.setAttribute('role', 'link');
            el.setAttribute('tabindex', '0');
            const spy = jest.spyOn(el, 'focus');
            focusFirstInteractiveElement(createContainer(el));
            expect(spy).toHaveBeenCalled();
        });
    });
});
