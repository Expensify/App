import Log from '@libs/Log';
import type GetActiveElement from './types';

const getActiveElement: GetActiveElement = () => document.activeElement;

const addCSS = (css: string, styleId: string) => {
    const existingStyle = document.getElementById(styleId);

    if (existingStyle) {
        if ('styleSheet' in existingStyle) {
            // Supports IE8 and below
            (existingStyle.styleSheet as CSSStyleDeclaration).cssText = css;
        } else {
            existingStyle.innerHTML = css;
        }
    } else {
        const styleElement = document.createElement('style');
        styleElement.setAttribute('id', styleId);
        styleElement.setAttribute('type', 'text/css');

        if ('styleSheet' in styleElement) {
            // Supports IE8 and below
            (styleElement.styleSheet as CSSStyleDeclaration).cssText = css;
        } else {
            styleElement.appendChild(document.createTextNode(css));
        }

        const head = document.getElementsByTagName('head')[0];
        head.appendChild(styleElement);
    }
};

/**
 * Customizes the background and text colors for autofill inputs in Chrome
 * Chrome on iOS does not support the autofill pseudo class because it is a non-standard webkit feature.
 * We should rely on the chrome-autofilled property being added to the input when users use auto-fill
 */
const getAutofilledInputStyle = (inputTextColor: string, cssSelector = '') => `
   ${cssSelector} input[chrome-autofilled],
    ${cssSelector} input[chrome-autofilled]:hover,
    ${cssSelector} input[chrome-autofilled]:focus,
    ${cssSelector} textarea[chrome-autofilled],
    ${cssSelector}  textarea[chrome-autofilled]:hover,
    ${cssSelector} textarea[chrome-autofilled]:focus,
    ${cssSelector} select[chrome-autofilled],
    ${cssSelector} select[chrome-autofilled]:hover,
    ${cssSelector} select[chrome-autofilled]:focus,
    ${cssSelector} input:-webkit-autofill,
    ${cssSelector} input:-webkit-autofill:hover,
    ${cssSelector} input:-webkit-autofill:focus,
    ${cssSelector} textarea:-webkit-autofill,
    ${cssSelector} textarea:-webkit-autofill:hover,
    ${cssSelector} textarea:-webkit-autofill:focus,
    ${cssSelector} select:-webkit-autofill,
    ${cssSelector} select:-webkit-autofill:hover,
    ${cssSelector} select:-webkit-autofill:focus {
        -webkit-background-clip: text;
        -webkit-text-fill-color: ${inputTextColor};
        caret-color: ${inputTextColor};
    }
`;

/**
 * Force Safari to recalculate textarea text line wrapping.
 *
 * Safari Bug: When textarea height decreases via CSS, Safari's text layout engine does not immediately
 * recalculate line wrapping. Words that should reflow to fewer lines remain on their original lines until
 * Safari's deferred layout pass runs (3-4 seconds later).
 *
 * This function temporarily clears and restores the textarea value, which forces Safari to rebuild the
 * text layout from scratch. It also preserves the cursor position and scroll state.
 */
const forceSafariTextReflow = (element: HTMLInputElement) => {
    try {
        const currentValue = element.value;
        const selectionStart = element.selectionStart;
        const selectionEnd = element.selectionEnd;
        const scrollTop = element.scrollTop;

        // Force layout recalculation
        // eslint-disable-next-line no-param-reassign
        element.value = '';
        // eslint-disable-next-line no-param-reassign
        element.value = currentValue;

        // Restore state
        if (selectionStart !== null && selectionEnd !== null) {
            element.setSelectionRange(selectionStart, selectionEnd);
        }
        // eslint-disable-next-line no-param-reassign
        element.scrollTop = scrollTop;
    } catch (error) {
        // Fail silently - textarea will still work, just with delayed updates
        Log.warn('[DomUtils] Safari text reflow fix failed:', {error});
    }
};

export default {
    addCSS,
    getAutofilledInputStyle,
    getActiveElement,
    requestAnimationFrame: window.requestAnimationFrame.bind(window),
    forceSafariTextReflow,
};
