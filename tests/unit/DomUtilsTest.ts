import DomUtils from '@libs/DomUtils';
import type * as DomUtilsModule from '@libs/DomUtils';

// Jest prefers index.native.ts, so load the web implementation for this DOM suite.
jest.mock('@libs/DomUtils', () => jest.requireActual<typeof DomUtilsModule>('@libs/DomUtils/index.ts'));

describe('DomUtils.addCSS', () => {
    afterEach(() => {
        for (const id of ['existing-modern', 'new-modern', 'existing-legacy', 'new-legacy']) {
            document.getElementById(id)?.remove();
        }
        jest.restoreAllMocks();
    });

    it('updates an existing modern style element', () => {
        // Given a modern style node already in the document
        const style = document.createElement('style');
        style.id = 'existing-modern';
        document.head.appendChild(style);
        // When its CSS is replaced
        DomUtils.addCSS('input {color: red}', style.id);
        // Then the existing node receives the new CSS
        expect(style.innerHTML).toBe('input {color: red}');
        expect(document.querySelectorAll('#existing-modern')).toHaveLength(1);
    });

    it('creates a modern style element with a CSS text node', () => {
        // Given no matching style node
        // When CSS is added
        DomUtils.addCSS('input {color: blue}', 'new-modern');
        // Then the created node contains the CSS text
        expect(document.getElementById('new-modern')?.firstChild?.textContent).toBe('input {color: blue}');
    });

    it('writes cssText to an existing legacy styleSheet', () => {
        // Given an existing legacy node with a styleSheet capability
        const style = document.createElement('style');
        style.id = 'existing-legacy';
        const styleSheet = {cssText: ''};
        Object.defineProperty(style, 'styleSheet', {value: styleSheet});
        document.head.appendChild(style);
        // When CSS is added
        DomUtils.addCSS('input {color: green}', style.id);
        // Then the legacy styleSheet receives it
        expect(styleSheet.cssText).toBe('input {color: green}');
    });

    it('writes cssText to a newly created legacy styleSheet', () => {
        // Given a browser that creates legacy style nodes
        const style = document.createElement('style');
        const styleSheet = {cssText: ''};
        Object.defineProperty(style, 'styleSheet', {value: styleSheet});
        jest.spyOn(document, 'createElement').mockReturnValue(style);
        // When CSS is added
        DomUtils.addCSS('input {color: black}', 'new-legacy');
        // Then the new legacy styleSheet receives it
        expect(styleSheet.cssText).toBe('input {color: black}');
        expect(document.getElementById('new-legacy')).not.toBeNull();
    });

    it('retains the autofill selector and text color', () => {
        // Given a scoped autofill selector
        // When autofill CSS is generated
        const css = DomUtils.getAutofilledInputStyle('red', '.form');
        // Then input, textarea, and select rules keep the scope and color
        expect(css).toContain('.form input[chrome-autofilled]');
        expect(css).toContain('.form textarea[chrome-autofilled]');
        expect(css).toContain('.form select[chrome-autofilled]');
        expect(css).toContain('-webkit-text-fill-color: red');
    });
});
