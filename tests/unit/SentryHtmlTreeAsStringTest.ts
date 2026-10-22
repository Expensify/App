import {htmlTreeAsString} from '@sentry/browser-utils';

/**
 * `@sentry/browser-utils` builds the element selectors that web INP, CLS and LCP spans, click breadcrumbs and Session Replay report.
 * We patch it (patches/sentry-browser-utils) to use `data-sentry-label`, so these tests fail if a Sentry bump drops or bypasses the patch.
 */
function getElement(id: string): Element {
    const element = document.getElementById(id);
    if (!element) {
        throw new Error(`Element with id "${id}" not found`);
    }
    return element;
}

describe('Sentry htmlTreeAsString', () => {
    afterEach(() => {
        document.body.innerHTML = '';
    });

    it('returns only the label when the labelled element is the pressable', () => {
        // Given a labelled pressable with nested content, like the DOM react-native-web renders for PressableWithFeedback
        document.body.innerHTML = `
            <div data-tag="pressable" data-sentry-label="SaveButton">
                <div class="css-view">
                    <span id="target">Save</span>
                </div>
            </div>`;

        // When Sentry describes an interaction with the inner text
        const selector = htmlTreeAsString(getElement('target'));

        // Then the span is attributed to the pressable's label alone, so the same button groups under one selector no matter which child was hit
        expect(selector).toBe('[data-sentry-label="SaveButton"]');
    });

    it('keeps the CSS path when the label is on an ancestor that is not the pressable', () => {
        // Given a label on a wrapper and an unlabelled pressable inside it
        document.body.innerHTML = `
            <div data-sentry-label="ReportHeader">
                <div data-tag="pressable">
                    <span id="target">Title</span>
                </div>
            </div>`;

        // When Sentry describes an interaction with the inner text
        const selector = htmlTreeAsString(getElement('target'));

        // Then the selector carries the label and still points at the element that was hit
        expect(selector).toBe('body > [data-sentry-label="ReportHeader"] > div > span#target');
    });

    it('prefixes the label when it is too far up to be part of the CSS path', () => {
        // Given a label more levels above the target than Sentry walks when building the CSS path
        document.body.innerHTML = `
            <section data-sentry-label="SearchPage">
                <div><div><div><div><div>
                    <span id="target">Result</span>
                </div></div></div></div></div>
            </section>`;

        // When Sentry describes an interaction with the deeply nested text
        const selector = htmlTreeAsString(getElement('target'));

        // Then the label is prepended to the CSS path so the span is still attributable to a screen area
        expect(selector).toBe('[data-sentry-label="SearchPage"] div > div > div > div > span#target');
    });

    it('skips labels on disabled elements', () => {
        // Given a disabled labelled pressable nested inside an enabled labelled pressable
        document.body.innerHTML = `
            <div data-tag="pressable" data-sentry-label="Row">
                <div data-tag="pressable" data-sentry-label="DisabledButton" aria-disabled="true">
                    <span id="target">Disabled</span>
                </div>
            </div>`;

        // When Sentry describes an interaction with the disabled button's text
        const selector = htmlTreeAsString(getElement('target'));

        // Then the disabled button's label is ignored, because a disabled element did not handle the interaction
        expect(selector).not.toContain('DisabledButton');
        expect(selector).toContain('[data-sentry-label="Row"]');
    });

    it('falls back to the CSS path when no element is labelled', () => {
        // Given an unlabelled pressable
        document.body.innerHTML = `
            <div data-tag="pressable" class="button">
                <span id="target">Unlabelled</span>
            </div>`;

        // When Sentry describes an interaction with the inner text
        const selector = htmlTreeAsString(getElement('target'));

        // Then Sentry's default CSS selector is kept unchanged
        expect(selector).toBe('body > div.button > span#target');
    });
});
