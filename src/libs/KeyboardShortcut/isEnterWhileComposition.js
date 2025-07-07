"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Browser = require("@libs/Browser");
var CONST_1 = require("@src/CONST");
/**
 * Check if the Enter key was pressed during IME confirmation (i.e. while the text is being composed).
 * See {@link https://en.wikipedia.org/wiki/Input_method}
 */
var isEnterWhileComposition = function (event) {
    var _a;
    // if on mobile chrome, the enter key event is never fired when the enter key is pressed while composition.
    if (Browser.isMobileChrome()) {
        return false;
    }
    // On Safari, isComposing returns false on Enter keypress event even for IME confirmation. Although keyCode is deprecated,
    // reading keyCode is the only way available to distinguish Enter keypress event for IME confirmation.
    if (CONST_1.default.BROWSER.SAFARI === Browser.getBrowser()) {
        return event.keyCode === 229;
    }
    return event.key === CONST_1.default.KEYBOARD_SHORTCUTS.ENTER.shortcutKey && ((_a = event === null || event === void 0 ? void 0 : event.nativeEvent) === null || _a === void 0 ? void 0 : _a.isComposing);
};
exports.default = isEnterWhileComposition;
