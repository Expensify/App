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
const getAutofilledInputStyle = (inputTextColor: string, topSelectors = '') => `
   ${topSelectors} input[chrome-autofilled],
    ${topSelectors} input[chrome-autofilled]:hover,
    ${topSelectors} input[chrome-autofilled]:focus,
    ${topSelectors} textarea[chrome-autofilled],
    ${topSelectors}  textarea[chrome-autofilled]:hover,
    ${topSelectors} textarea[chrome-autofilled]:focus,
    ${topSelectors} select[chrome-autofilled],
    ${topSelectors} select[chrome-autofilled]:hover,
    ${topSelectors} select[chrome-autofilled]:focus,
    ${topSelectors} input:-webkit-autofill,
    ${topSelectors} input:-webkit-autofill:hover,
    ${topSelectors} input:-webkit-autofill:focus,
    ${topSelectors} textarea:-webkit-autofill,
    ${topSelectors} textarea:-webkit-autofill:hover,
    ${topSelectors} textarea:-webkit-autofill:focus,
    ${topSelectors} select:-webkit-autofill,
    ${topSelectors} select:-webkit-autofill:hover,
    ${topSelectors} select:-webkit-autofill:focus {
        -webkit-background-clip: text;
        -webkit-text-fill-color: ${inputTextColor};
        caret-color: ${inputTextColor};
    }
`;

export default {
    addCSS,
    getAutofilledInputStyle,
    getActiveElement,
    requestAnimationFrame: window.requestAnimationFrame.bind(window),
};
