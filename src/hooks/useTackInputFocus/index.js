"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = useTackInputFocus;
var react_1 = require("react");
var useDebouncedState_1 = require("@hooks/useDebouncedState");
var Browser_1 = require("@libs/Browser");
var CONST_1 = require("@src/CONST");
/**
 * Detects input or text area focus on browsers, to avoid scrolling on virtual viewports
 */
function useTackInputFocus(enable) {
    if (enable === void 0) { enable = false; }
    var _a = (0, useDebouncedState_1.default)(false), isInputFocusDebounced = _a[1], setIsInputFocus = _a[2];
    var handleFocusIn = (0, react_1.useCallback)(function (event) {
        var targetElement = event.target;
        if (targetElement.tagName === CONST_1.default.ELEMENT_NAME.INPUT || targetElement.tagName === CONST_1.default.ELEMENT_NAME.TEXTAREA) {
            setIsInputFocus(true);
        }
    }, [setIsInputFocus]);
    var handleFocusOut = (0, react_1.useCallback)(function (event) {
        var targetElement = event.target;
        if (targetElement.tagName === CONST_1.default.ELEMENT_NAME.INPUT || targetElement.tagName === CONST_1.default.ELEMENT_NAME.TEXTAREA) {
            setIsInputFocus(false);
        }
    }, [setIsInputFocus]);
    (0, react_1.useEffect)(function () {
        var _a;
        if (!enable) {
            return;
        }
        // Putting the function here so a new instance of the function is created for each usage of the hook
        var resetScrollPositionOnVisualViewport = function () {
            var _a;
            if ((0, Browser_1.isChromeIOS)() && ((_a = window.visualViewport) === null || _a === void 0 ? void 0 : _a.offsetTop)) {
                // On Chrome iOS, the visual viewport triggers a scroll event when the keyboard is opened, but some time the scroll position is not correct.
                // So this change is specific to Chrome iOS, helping to reset the viewport position correctly.
                window.scrollTo({ top: -window.visualViewport.offsetTop });
            }
            else {
                window.scrollTo({ top: 0 });
            }
        };
        window.addEventListener('focusin', handleFocusIn);
        window.addEventListener('focusout', handleFocusOut);
        (_a = window.visualViewport) === null || _a === void 0 ? void 0 : _a.addEventListener('scroll', resetScrollPositionOnVisualViewport);
        return function () {
            var _a;
            window.removeEventListener('focusin', handleFocusIn);
            window.removeEventListener('focusout', handleFocusOut);
            (_a = window.visualViewport) === null || _a === void 0 ? void 0 : _a.removeEventListener('scroll', resetScrollPositionOnVisualViewport);
        };
    }, [enable, handleFocusIn, handleFocusOut]);
    return isInputFocusDebounced;
}
