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

    describe('focus behavior', () => {
        it('focuses the first button with data-programmatic-focus and outline suppressed', () => {
            const button = document.createElement('button');
            button.setAttribute('aria-label', 'Back');
            const container = createContainer(button);
            const spy = jest.spyOn(button, 'focus');

            expect(focusFirstInteractiveElement(container)).toBe(true);
            expect(spy).toHaveBeenCalledWith({preventScroll: true});
            expect(button.getAttribute('data-programmatic-focus')).toBe('true');
            expect(button.style.outline).toBe('none');
        });

        it('focuses the first link element', () => {
            const link = document.createElement('a');
            link.setAttribute('href', '#');
            const container = createContainer(link);
            const spy = jest.spyOn(link, 'focus');

            expect(focusFirstInteractiveElement(container)).toBe(true);
            expect(spy).toHaveBeenCalledWith({preventScroll: true});
        });

        it('focuses an input element', () => {
            const input = document.createElement('input');
            const container = createContainer(input);
            const spy = jest.spyOn(input, 'focus');

            expect(focusFirstInteractiveElement(container)).toBe(true);
            expect(spy).toHaveBeenCalledWith({preventScroll: true});
        });

        it('suppression attributes survive blur (tab-switch resilience)', () => {
            const button = document.createElement('button');
            const container = createContainer(button);

            focusFirstInteractiveElement(container);
            expect(button.getAttribute('data-programmatic-focus')).toBe('true');
            expect(button.style.outline).toBe('none');

            button.dispatchEvent(new Event('blur'));

            expect(button.getAttribute('data-programmatic-focus')).toBe('true');
            expect(button.style.outline).toBe('none');
        });

        it('on first Tab, prevents default and re-focuses without suppression', () => {
            const button = document.createElement('button');
            const container = createContainer(button);
            const focusSpy = jest.spyOn(button, 'focus');

            focusFirstInteractiveElement(container);
            expect(focusSpy).toHaveBeenCalledTimes(1);
            expect(button.getAttribute('data-programmatic-focus')).toBe('true');

            const tabEvent = new KeyboardEvent('keydown', {key: 'Tab', bubbles: true, cancelable: true});
            const preventSpy = jest.spyOn(tabEvent, 'preventDefault');
            document.dispatchEvent(tabEvent);

            expect(preventSpy).toHaveBeenCalled();
            expect(focusSpy).toHaveBeenCalledTimes(2);
            expect(button.getAttribute('data-programmatic-focus')).toBeNull();
            expect(button.style.outline).toBe('');
        });

        it('on first Tab when focus moved away, does not prevent default', () => {
            const button = document.createElement('button');
            const container = createContainer(button);

            focusFirstInteractiveElement(container);

            // Simulate focus moving away (e.g., user clicked elsewhere)
            const otherInput = document.createElement('input');
            document.body.appendChild(otherInput);
            otherInput.focus();

            const tabEvent = new KeyboardEvent('keydown', {key: 'Tab', bubbles: true, cancelable: true});
            const preventSpy = jest.spyOn(tabEvent, 'preventDefault');
            document.dispatchEvent(tabEvent);

            expect(preventSpy).not.toHaveBeenCalled();
        });

        it('on non-Tab keys, does not prevent default and keeps listener for Tab', () => {
            // Reset to page-load modality so suppression path is taken
            document.dispatchEvent(new MouseEvent('mousedown', {bubbles: true}));

            const button = document.createElement('button');
            const container = createContainer(button);
            const focusSpy = jest.spyOn(button, 'focus');

            focusFirstInteractiveElement(container);
            expect(focusSpy).toHaveBeenCalledTimes(1);
            expect(button.getAttribute('data-programmatic-focus')).toBe('true');

            // Arrow key should not trigger interception or remove the listener
            const arrowEvent = new KeyboardEvent('keydown', {key: 'ArrowDown', bubbles: true, cancelable: true});
            document.dispatchEvent(arrowEvent);
            expect(arrowEvent.defaultPrevented).toBe(false);

            // Suppression attributes should still be present (listener survived ArrowDown)
            expect(button.getAttribute('data-programmatic-focus')).toBe('true');
            expect(button.style.outline).toBe('none');
        });
    });

    describe('aria-hidden filtering', () => {
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

            expect(focusFirstInteractiveElement(container)).toBe(true);
            expect(hiddenSpy).not.toHaveBeenCalled();
            expect(visibleSpy).toHaveBeenCalledWith({preventScroll: true});
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
    });

    // These tests run after the 'non-Tab key' test above dispatched a keydown,
    // which sets the module-level hadKeyboardEvent = true (keyboard mode).
    describe('after keyboard interaction (hadKeyboardEvent = true)', () => {
        it('focuses without data-programmatic-focus or outline suppression', () => {
            const button = document.createElement('button');
            const container = createContainer(button);
            const spy = jest.spyOn(button, 'focus');

            expect(focusFirstInteractiveElement(container)).toBe(true);
            expect(spy).toHaveBeenCalledWith({preventScroll: true});
            expect(button.getAttribute('data-programmatic-focus')).toBeNull();
            expect(button.style.outline).toBe('');
        });

        it('does not register onFirstTab handler', () => {
            const button = document.createElement('button');
            const container = createContainer(button);
            const focusSpy = jest.spyOn(button, 'focus');

            focusFirstInteractiveElement(container);
            expect(focusSpy).toHaveBeenCalledTimes(1);

            const tabEvent = new KeyboardEvent('keydown', {key: 'Tab', bubbles: true, cancelable: true});
            const preventSpy = jest.spyOn(tabEvent, 'preventDefault');
            document.dispatchEvent(tabEvent);

            // Tab should NOT be intercepted — no preventDefault, no re-focus
            expect(preventSpy).not.toHaveBeenCalled();
            expect(focusSpy).toHaveBeenCalledTimes(1);
        });
    });

    // This test runs last — after keyboard tests set hadKeyboardEvent = true,
    // a mousedown resets it back to false, restoring suppression behavior.
    describe('after mouse resets keyboard flag (mousedown after keydown)', () => {
        it('restores focus ring suppression and onFirstTab after mousedown', () => {
            // hadKeyboardEvent is true from previous tests' keydown dispatches.
            // Mousedown resets it to false.
            document.dispatchEvent(new MouseEvent('mousedown', {bubbles: true}));

            const button = document.createElement('button');
            const container = createContainer(button);
            const focusSpy = jest.spyOn(button, 'focus');

            expect(focusFirstInteractiveElement(container)).toBe(true);
            expect(focusSpy).toHaveBeenCalledTimes(1);
            expect(button.getAttribute('data-programmatic-focus')).toBe('true');
            expect(button.style.outline).toBe('none');

            // Tab should be intercepted — re-focus with visible ring
            const tabEvent = new KeyboardEvent('keydown', {key: 'Tab', bubbles: true, cancelable: true});
            const preventSpy = jest.spyOn(tabEvent, 'preventDefault');
            document.dispatchEvent(tabEvent);

            expect(preventSpy).toHaveBeenCalled();
            expect(focusSpy).toHaveBeenCalledTimes(2);
            expect(button.getAttribute('data-programmatic-focus')).toBeNull();
            expect(button.style.outline).toBe('');
        });
    });
});
