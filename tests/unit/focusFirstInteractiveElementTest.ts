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

afterEach(() => {
    document.body.innerHTML = '';
});

describe('focusFirstInteractiveElement', () => {
    describe('guard conditions', () => {
        it('returns false when container is null', () => {
            expect(focusFirstInteractiveElement(null)).toBe(false);
        });

        it('returns false when another element already has focus', () => {
            const input = document.createElement('input');
            document.body.appendChild(input);
            input.focus();
            const button = document.createElement('button');
            const container = createContainer(button);
            const spy = jest.spyOn(button, 'focus');

            expect(focusFirstInteractiveElement(container)).toBe(false);
            expect(spy).not.toHaveBeenCalled();
        });

        it('returns false when container has no focusable elements', () => {
            const container = createContainer(document.createElement('div'));

            expect(focusFirstInteractiveElement(container)).toBe(false);
        });
    });

    describe('focus with focusVisible (page-load modality)', () => {
        beforeEach(() => {
            document.dispatchEvent(new MouseEvent('mousedown', {bubbles: true}));
        });

        it('focuses with focusVisible: false', () => {
            const button = document.createElement('button');
            const container = createContainer(button);
            const spy = jest.spyOn(button, 'focus');

            expect(focusFirstInteractiveElement(container)).toBe(true);
            expect(spy).toHaveBeenCalledWith({preventScroll: true, focusVisible: false});
        });
    });

    describe('focus with focusVisible (keyboard modality)', () => {
        beforeEach(() => {
            document.dispatchEvent(new KeyboardEvent('keydown', {key: 'Enter', bubbles: true}));
        });

        it('focuses with focusVisible: true', () => {
            const button = document.createElement('button');
            const container = createContainer(button);
            const spy = jest.spyOn(button, 'focus');

            expect(focusFirstInteractiveElement(container)).toBe(true);
            expect(spy).toHaveBeenCalledWith({preventScroll: true, focusVisible: true});
        });
    });

    describe('mouse resets keyboard flag', () => {
        beforeEach(() => {
            document.dispatchEvent(new KeyboardEvent('keydown', {key: 'Enter', bubbles: true}));
            document.dispatchEvent(new MouseEvent('mousedown', {bubbles: true}));
        });

        it('focuses with focusVisible: false after mousedown', () => {
            const button = document.createElement('button');
            const container = createContainer(button);
            const spy = jest.spyOn(button, 'focus');

            expect(focusFirstInteractiveElement(container)).toBe(true);
            expect(spy).toHaveBeenCalledWith({preventScroll: true, focusVisible: false});
        });
    });

    describe('aria-hidden filtering', () => {
        beforeEach(() => {
            document.dispatchEvent(new KeyboardEvent('keydown', {key: 'Enter', bubbles: true}));
        });

        it('skips elements inside aria-hidden containers', () => {
            const hiddenDiv = document.createElement('div');
            hiddenDiv.setAttribute('aria-hidden', 'true');
            const hiddenButton = document.createElement('button');
            hiddenDiv.appendChild(hiddenButton);
            const visibleButton = document.createElement('button');
            visibleButton.setAttribute('aria-label', 'Visible');
            const container = createContainer(hiddenDiv, visibleButton);
            const hiddenSpy = jest.spyOn(hiddenButton, 'focus');
            const visibleSpy = jest.spyOn(visibleButton, 'focus');

            focusFirstInteractiveElement(container);
            expect(hiddenSpy).not.toHaveBeenCalled();
            expect(visibleSpy).toHaveBeenCalled();
        });

        it('returns false when all focusable elements are aria-hidden', () => {
            const hiddenDiv = document.createElement('div');
            hiddenDiv.setAttribute('aria-hidden', 'true');
            const hiddenButton = document.createElement('button');
            hiddenDiv.appendChild(hiddenButton);
            const container = createContainer(hiddenDiv);

            expect(focusFirstInteractiveElement(container)).toBe(false);
        });
    });

    describe('focusable element selection', () => {
        beforeEach(() => {
            document.dispatchEvent(new KeyboardEvent('keydown', {key: 'Enter', bubbles: true}));
        });

        it('finds elements with role="button"', () => {
            const div = document.createElement('div');
            div.setAttribute('role', 'button');
            div.setAttribute('tabindex', '0');
            const container = createContainer(div);
            const spy = jest.spyOn(div, 'focus');

            focusFirstInteractiveElement(container);
            expect(spy).toHaveBeenCalled();
        });

        it('finds elements with role="link"', () => {
            const div = document.createElement('div');
            div.setAttribute('role', 'link');
            div.setAttribute('tabindex', '0');
            const container = createContainer(div);
            const spy = jest.spyOn(div, 'focus');

            focusFirstInteractiveElement(container);
            expect(spy).toHaveBeenCalled();
        });

        it('finds textarea elements', () => {
            const textarea = document.createElement('textarea');
            const container = createContainer(textarea);
            const spy = jest.spyOn(textarea, 'focus');

            focusFirstInteractiveElement(container);
            expect(spy).toHaveBeenCalled();
        });

        it('finds select elements', () => {
            const select = document.createElement('select');
            const container = createContainer(select);
            const spy = jest.spyOn(select, 'focus');

            focusFirstInteractiveElement(container);
            expect(spy).toHaveBeenCalled();
        });

        it('finds input elements', () => {
            const input = document.createElement('input');
            const container = createContainer(input);
            const spy = jest.spyOn(input, 'focus');

            focusFirstInteractiveElement(container);
            expect(spy).toHaveBeenCalled();
        });

        it('finds link elements', () => {
            const link = document.createElement('a');
            link.setAttribute('href', '#');
            const container = createContainer(link);
            const spy = jest.spyOn(link, 'focus');

            focusFirstInteractiveElement(container);
            expect(spy).toHaveBeenCalled();
        });

        it('skips elements with tabindex="-1"', () => {
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

        it('skips disabled elements', () => {
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

        it('skips elements with aria-disabled="true"', () => {
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
    });
});
