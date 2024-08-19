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
const getAutofilledInputStyle = (inputTextColor: string) => `
    input[chrome-autofilled],
    input[chrome-autofilled]:hover,
    input[chrome-autofilled]:focus,
    textarea[chrome-autofilled],
    textarea[chrome-autofilled]:hover,
    textarea[chrome-autofilled]:focus,
    select[chrome-autofilled],
    select[chrome-autofilled]:hover,
    select[chrome-autofilled]:focus,
    input:-webkit-autofill,
    input:-webkit-autofill:hover,
    input:-webkit-autofill:focus,
    textarea:-webkit-autofill,
    textarea:-webkit-autofill:hover,
    textarea:-webkit-autofill:focus,
    select:-webkit-autofill,
    select:-webkit-autofill:hover,
    select:-webkit-autofill:focus {
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
