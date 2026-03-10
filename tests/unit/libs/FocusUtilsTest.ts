import type FocusUtilsModule from '@libs/focusUtils/types';

const FocusUtils = jest.requireActual<{default: FocusUtilsModule}>('../../../src/libs/focusUtils/index.ts').default;
const FocusUtilsFallback = jest.requireActual<{default: FocusUtilsModule}>('../../../src/libs/focusUtils/index.native.ts').default;

function createMockElement(tagName: string, id: string, options?: {appendToBody?: boolean; width?: number; height?: number}) {
    const element = document.createElement(tagName);
    element.id = id;

    if (options?.appendToBody !== false) {
        document.body.appendChild(element);
    }

    element.getBoundingClientRect = jest.fn(() => ({
        width: options?.width ?? 100,
        height: options?.height ?? 50,
        top: 0,
        left: 0,
        bottom: options?.height ?? 50,
        right: options?.width ?? 100,
        x: 0,
        y: 0,
        toJSON: () => ({}),
    }));

    return element;
}

describe('FocusUtils web implementation', () => {
    afterEach(() => {
        document.body.innerHTML = '';
    });

    describe('isElementFocusRestorable', () => {
        it('returns false for null', () => {
            expect(FocusUtils.isElementFocusRestorable(null)).toBe(false);
        });

        it('returns false for document.body', () => {
            expect(FocusUtils.isElementFocusRestorable(document.body)).toBe(false);
        });

        it('returns false for document.documentElement', () => {
            expect(FocusUtils.isElementFocusRestorable(document.documentElement)).toBe(false);
        });

        it('returns false for detached elements', () => {
            const detachedButton = createMockElement('button', 'detached-button', {appendToBody: false});

            expect(FocusUtils.isElementFocusRestorable(detachedButton)).toBe(false);
        });

        it('returns false for display none elements', () => {
            const hiddenButton = createMockElement('button', 'display-none-button');
            hiddenButton.style.display = 'none';

            expect(FocusUtils.isElementFocusRestorable(hiddenButton)).toBe(false);
        });

        it('returns false for visibility hidden elements', () => {
            const hiddenButton = createMockElement('button', 'visibility-hidden-button');
            hiddenButton.style.visibility = 'hidden';

            expect(FocusUtils.isElementFocusRestorable(hiddenButton)).toBe(false);
        });

        it('returns false for disabled elements', () => {
            const disabledButton = createMockElement('button', 'disabled-button');
            disabledButton.setAttribute('disabled', '');

            expect(FocusUtils.isElementFocusRestorable(disabledButton)).toBe(false);
        });

        it('returns false for elements that are themselves inert', () => {
            const inertButton = createMockElement('button', 'self-inert-button');
            inertButton.setAttribute('inert', '');

            expect(FocusUtils.isElementFocusRestorable(inertButton)).toBe(false);
        });

        it('returns false for descendants of inert containers', () => {
            const inertContainer = createMockElement('div', 'inert-container');
            inertContainer.setAttribute('inert', '');
            const button = document.createElement('button');
            button.id = 'button-in-inert';
            button.getBoundingClientRect = jest.fn(() => ({
                width: 100,
                height: 50,
                top: 0,
                left: 0,
                bottom: 50,
                right: 100,
                x: 0,
                y: 0,
                toJSON: () => ({}),
            }));
            inertContainer.appendChild(button);

            expect(FocusUtils.isElementFocusRestorable(button)).toBe(false);
        });

        it('returns false when both width and height are zero', () => {
            const zeroSizeButton = createMockElement('button', 'zero-size-button', {width: 0, height: 0});

            expect(FocusUtils.isElementFocusRestorable(zeroSizeButton)).toBe(false);
        });

        it('returns true when only width is zero', () => {
            const zeroWidthButton = createMockElement('button', 'zero-width-button', {width: 0, height: 50});

            expect(FocusUtils.isElementFocusRestorable(zeroWidthButton)).toBe(true);
        });

        it('returns true when only height is zero', () => {
            const zeroHeightButton = createMockElement('button', 'zero-height-button', {width: 100, height: 0});

            expect(FocusUtils.isElementFocusRestorable(zeroHeightButton)).toBe(true);
        });

        it('returns true for aria-disabled elements when otherwise valid', () => {
            const ariaDisabledButton = createMockElement('button', 'aria-disabled-button');
            ariaDisabledButton.setAttribute('aria-disabled', 'true');

            expect(FocusUtils.isElementFocusRestorable(ariaDisabledButton)).toBe(true);
        });
    });

    describe('isFocusableActionableElement', () => {
        it('returns true for role button with tabIndex 0', () => {
            const button = createMockElement('div', 'role-button');
            button.setAttribute('role', 'button');
            button.tabIndex = 0;

            expect(FocusUtils.isFocusableActionableElement(button)).toBe(true);
        });

        it('returns true for role menuitem with tabIndex 0', () => {
            const menuitem = createMockElement('div', 'role-menuitem');
            menuitem.setAttribute('role', 'menuitem');
            menuitem.tabIndex = 0;

            expect(FocusUtils.isFocusableActionableElement(menuitem)).toBe(true);
        });

        it('returns false for wrong role even when tabbable', () => {
            const wrongRole = createMockElement('div', 'wrong-role');
            wrongRole.setAttribute('role', 'link');
            wrongRole.tabIndex = 0;

            expect(FocusUtils.isFocusableActionableElement(wrongRole)).toBe(false);
        });

        it('returns false for tabIndex -1', () => {
            const nonTabbableButton = createMockElement('div', 'non-tabbable-button');
            nonTabbableButton.setAttribute('role', 'button');
            nonTabbableButton.tabIndex = -1;

            expect(FocusUtils.isFocusableActionableElement(nonTabbableButton)).toBe(false);
        });

        it('returns false for disabled elements', () => {
            const disabledButton = createMockElement('div', 'disabled-actionable');
            disabledButton.setAttribute('role', 'button');
            disabledButton.tabIndex = 0;
            disabledButton.setAttribute('disabled', '');

            expect(FocusUtils.isFocusableActionableElement(disabledButton)).toBe(false);
        });

        it('returns false for aria-disabled elements', () => {
            const ariaDisabledButton = createMockElement('div', 'aria-disabled-actionable');
            ariaDisabledButton.setAttribute('role', 'button');
            ariaDisabledButton.tabIndex = 0;
            ariaDisabledButton.setAttribute('aria-disabled', 'true');

            expect(FocusUtils.isFocusableActionableElement(ariaDisabledButton)).toBe(false);
        });

        it('returns false for elements that are themselves inert', () => {
            const inertButton = createMockElement('div', 'self-inert-actionable');
            inertButton.setAttribute('role', 'button');
            inertButton.tabIndex = 0;
            inertButton.setAttribute('inert', '');

            expect(FocusUtils.isFocusableActionableElement(inertButton)).toBe(false);
        });

        it('returns false for descendants of inert containers', () => {
            const inertContainer = createMockElement('div', 'inert-actionable-container');
            inertContainer.setAttribute('inert', '');
            const button = document.createElement('div');
            button.id = 'inert-descendant-button';
            button.setAttribute('role', 'button');
            button.tabIndex = 0;
            button.getBoundingClientRect = jest.fn(() => ({
                width: 100,
                height: 50,
                top: 0,
                left: 0,
                bottom: 50,
                right: 100,
                x: 0,
                y: 0,
                toJSON: () => ({}),
            }));
            inertContainer.appendChild(button);

            expect(FocusUtils.isFocusableActionableElement(button)).toBe(false);
        });
    });
});

describe('FocusUtils default fallback', () => {
    it('returns false for both helpers', () => {
        const button = document.createElement('button');
        button.setAttribute('role', 'button');
        button.tabIndex = 0;

        expect(FocusUtilsFallback.isElementFocusRestorable(button)).toBe(false);
        expect(FocusUtilsFallback.isFocusableActionableElement(button)).toBe(false);
    });
});
