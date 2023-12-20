import GetActiveElement from './types';

const getActiveElement: GetActiveElement = () => document.activeElement;

const addCSS = (css: string, styleId: string) => {
    var head = document.getElementsByTagName('head')[0];
    var existingStyle = document.getElementById(styleId);

    if (existingStyle) {
        // If style tag with the specified ID exists, update its content
        if (existingStyle.styleSheet) {   // IE
            existingStyle.styleSheet.cssText = css;
        } else {                          // the world
            existingStyle.innerHTML = css;
        }
    } else {
        // If style tag doesn't exist, create a new one
        var s = document.createElement('style');
        s.setAttribute("id", styleId);
        s.setAttribute('type', 'text/css');

        if (s.styleSheet) {   // IE
            s.styleSheet.cssText = css;
        } else {              // the world
            s.appendChild(document.createTextNode(css));
        }

        head.appendChild(s);
    }
}

/* Customizes the background and text colors for autofill inputs in Chrome */
/* Chrome on iOS does not support the autofill pseudo class because it is a non-standard webkit feature.
We should rely on the chrome-autofilled property being added to the input when users use auto-fill */
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
