"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var KeyboardShortcut_1 = require("@libs/KeyboardShortcut");
var TestTool_1 = require("@userActions/TestTool");
var CONST_1 = require("@src/CONST");
function useDebugShortcut() {
    (0, react_1.useEffect)(function () {
        var debugShortcutConfig = CONST_1.default.KEYBOARD_SHORTCUTS.DEBUG;
        var unsubscribeDebugShortcut = KeyboardShortcut_1.default.subscribe(debugShortcutConfig.shortcutKey, function () { return (0, TestTool_1.default)(); }, debugShortcutConfig.descriptionKey, debugShortcutConfig.modifiers, true);
        return function () {
            unsubscribeDebugShortcut();
        };
        // Rule disabled because this effect is only for component did mount & will component unmount lifecycle event
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, []);
}
exports.default = useDebugShortcut;
