/** Exercises web CSS insertion against real DOM nodes, including the supported legacy stylesheet contribution. */
import type * as WebDomUtils from '@libs/DomUtils';

const {default: DomUtils} = jest.requireActual<typeof WebDomUtils>('../../src/libs/DomUtils/index.ts');

describe('web DomUtils', () => {
    afterEach(() => {
        for (const node of document.head.querySelectorAll('[id^="dom-utils-test"]')) {
            node.remove();
        }
        jest.restoreAllMocks();
    });

    it('creates and updates one modern style node for a repeated ID', () => {
        // Given a style ID not yet present in the document
        const id = 'dom-utils-test-modern';
        // When two theme updates target that ID
        DomUtils.addCSS('input {color: red;}', id);
        const style = document.getElementById(id);
        expect(style).toBeInstanceOf(HTMLStyleElement);
        expect(style?.getAttribute('type')).toBe('text/css');
        expect(style?.textContent).toBe('input {color: red;}');
        DomUtils.addCSS('input {color: blue;}', id);
        // Then the existing node holds the replacement CSS rather than accumulating duplicates
        expect(document.getElementById(id)).toBe(style);
        expect(document.querySelectorAll(`#${id}`)).toHaveLength(1);
        expect(style?.textContent).toBe('input {color: blue;}');
    });

    it.each([false, true])('writes the legacy cssText contribution with an existing node: %s', (existing) => {
        // Given the styleSheet contribution exposed by the supported legacy browser branch
        const style = document.createElement('style');
        style.id = 'dom-utils-test-legacy';
        const styleSheet = {cssText: ''};
        Object.defineProperty(style, 'styleSheet', {value: styleSheet});
        if (existing) {
            document.head.appendChild(style);
        } else {
            jest.spyOn(document, 'createElement').mockReturnValueOnce(style);
        }
        // When CSS is inserted and replaced through the real addCSS implementation
        DomUtils.addCSS('textarea {color: red;}', style.id);
        expect(styleSheet.cssText).toBe('textarea {color: red;}');
        DomUtils.addCSS('textarea {color: blue;}', style.id);
        // Then both legacy branches preserve node identity and write only the stylesheet
        expect(document.getElementById(style.id)).toBe(style);
        expect(styleSheet.cssText).toBe('textarea {color: blue;}');
        expect(style.childNodes).toHaveLength(0);
    });

    it.each(['', '.signin'])('generates every autofill selector and the exact color declarations for %s', (scope) => {
        // Given the App or sign-in selector and the theme text color
        const color = '#123456';
        // When the production generator builds CSS
        const css = DomUtils.getAutofilledInputStyle(color, scope);
        // Then every supported control/state shares the requested text and caret colors
        const selectors = css
            .slice(0, css.indexOf('{'))
            .split(',')
            .map((selector) => selector.trim().replaceAll(/\s+/g, ' '));
        expect(selectors).toEqual(
            ['[chrome-autofilled]', ':-webkit-autofill'].flatMap((suffix) =>
                ['input', 'textarea', 'select'].flatMap((control) => ['', ':hover', ':focus'].map((state) => `${scope} ${control}${suffix}${state}`.trim())),
            ),
        );
        expect(css.slice(css.indexOf('{')).replaceAll(/\s+/g, ' ').trim()).toBe(`{ -webkit-background-clip: text; -webkit-text-fill-color: ${color}; caret-color: ${color}; }`);
    });
});
