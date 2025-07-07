"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = useKeyboardShortcut;
var react_1 = require("react");
var KeyboardShortcut_1 = require("@libs/KeyboardShortcut");
var CONST_1 = require("@src/CONST");
/**
 * Register a keyboard shortcut handler.
 * Recommendation: To ensure stability, wrap the `callback` function with the useCallback hook before using it with this hook.
 */
function useKeyboardShortcut(shortcut, callback, config) {
    if (config === void 0) { config = {}; }
    var _a = config.captureOnInputs, captureOnInputs = _a === void 0 ? true : _a, _b = config.shouldBubble, shouldBubble = _b === void 0 ? false : _b, _c = config.priority, priority = _c === void 0 ? 0 : _c, _d = config.shouldPreventDefault, shouldPreventDefault = _d === void 0 ? true : _d, 
    // The "excludedNodes" array needs to be stable to prevent the "useEffect" hook from being recreated unnecessarily.
    // Hence the use of CONST.EMPTY_ARRAY.
    _e = config.excludedNodes, 
    // The "excludedNodes" array needs to be stable to prevent the "useEffect" hook from being recreated unnecessarily.
    // Hence the use of CONST.EMPTY_ARRAY.
    excludedNodes = _e === void 0 ? CONST_1.default.EMPTY_ARRAY : _e, _f = config.isActive, isActive = _f === void 0 ? true : _f, 
    // This flag is used to prevent auto submit form when press enter key on selection modal.
    _g = config.shouldStopPropagation, 
    // This flag is used to prevent auto submit form when press enter key on selection modal.
    shouldStopPropagation = _g === void 0 ? false : _g;
    (0, react_1.useEffect)(function () {
        var _a;
        if (!isActive) {
            return function () { };
        }
        var unsubscribe = KeyboardShortcut_1.default.subscribe(shortcut.shortcutKey, callback, (_a = shortcut.descriptionKey) !== null && _a !== void 0 ? _a : '', shortcut.modifiers, captureOnInputs, shouldBubble, priority, shouldPreventDefault, excludedNodes, shouldStopPropagation);
        return function () {
            unsubscribe();
        };
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, [isActive, callback, captureOnInputs, excludedNodes, priority, shortcut.descriptionKey, shortcut.modifiers.join(), shortcut.shortcutKey, shouldBubble, shouldPreventDefault]);
}
