"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var getActiveElement = function () { return document.activeElement; };
var addCSS = function (css, styleId) {
    var existingStyle = document.getElementById(styleId);
    if (existingStyle) {
        if ('styleSheet' in existingStyle) {
            // Supports IE8 and below
            existingStyle.styleSheet.cssText = css;
        }
        else {
            existingStyle.innerHTML = css;
        }
    }
    else {
        var styleElement = document.createElement('style');
        styleElement.setAttribute('id', styleId);
        styleElement.setAttribute('type', 'text/css');
        if ('styleSheet' in styleElement) {
            // Supports IE8 and below
            styleElement.styleSheet.cssText = css;
        }
        else {
            styleElement.appendChild(document.createTextNode(css));
        }
        var head = document.getElementsByTagName('head')[0];
        head.appendChild(styleElement);
    }
};
/**
 * Customizes the background and text colors for autofill inputs in Chrome
 * Chrome on iOS does not support the autofill pseudo class because it is a non-standard webkit feature.
 * We should rely on the chrome-autofilled property being added to the input when users use auto-fill
 */
var getAutofilledInputStyle = function (inputTextColor, cssSelector) {
    if (cssSelector === void 0) { cssSelector = ''; }
    return "\n   ".concat(cssSelector, " input[chrome-autofilled],\n    ").concat(cssSelector, " input[chrome-autofilled]:hover,\n    ").concat(cssSelector, " input[chrome-autofilled]:focus,\n    ").concat(cssSelector, " textarea[chrome-autofilled],\n    ").concat(cssSelector, "  textarea[chrome-autofilled]:hover,\n    ").concat(cssSelector, " textarea[chrome-autofilled]:focus,\n    ").concat(cssSelector, " select[chrome-autofilled],\n    ").concat(cssSelector, " select[chrome-autofilled]:hover,\n    ").concat(cssSelector, " select[chrome-autofilled]:focus,\n    ").concat(cssSelector, " input:-webkit-autofill,\n    ").concat(cssSelector, " input:-webkit-autofill:hover,\n    ").concat(cssSelector, " input:-webkit-autofill:focus,\n    ").concat(cssSelector, " textarea:-webkit-autofill,\n    ").concat(cssSelector, " textarea:-webkit-autofill:hover,\n    ").concat(cssSelector, " textarea:-webkit-autofill:focus,\n    ").concat(cssSelector, " select:-webkit-autofill,\n    ").concat(cssSelector, " select:-webkit-autofill:hover,\n    ").concat(cssSelector, " select:-webkit-autofill:focus {\n        -webkit-background-clip: text;\n        -webkit-text-fill-color: ").concat(inputTextColor, ";\n        caret-color: ").concat(inputTextColor, ";\n    }\n");
};
exports.default = {
    addCSS: addCSS,
    getAutofilledInputStyle: getAutofilledInputStyle,
    getActiveElement: getActiveElement,
    requestAnimationFrame: window.requestAnimationFrame.bind(window),
};
