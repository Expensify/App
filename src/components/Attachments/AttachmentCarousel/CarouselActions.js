"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var KeyboardShortcut_1 = require("@libs/KeyboardShortcut");
var CONST_1 = require("@src/CONST");
function CarouselActions(_a) {
    var onCycleThroughAttachments = _a.onCycleThroughAttachments;
    (0, react_1.useEffect)(function () {
        var shortcutLeftConfig = CONST_1.default.KEYBOARD_SHORTCUTS.ARROW_LEFT;
        var unsubscribeLeftKey = KeyboardShortcut_1.default.subscribe(shortcutLeftConfig.shortcutKey, function (event) {
            if ((event === null || event === void 0 ? void 0 : event.target) instanceof HTMLElement) {
                // prevents focus from highlighting around the modal
                event.target.blur();
            }
            onCycleThroughAttachments(-1);
        }, shortcutLeftConfig.descriptionKey, shortcutLeftConfig.modifiers);
        var shortcutRightConfig = CONST_1.default.KEYBOARD_SHORTCUTS.ARROW_RIGHT;
        var unsubscribeRightKey = KeyboardShortcut_1.default.subscribe(shortcutRightConfig.shortcutKey, function (event) {
            if ((event === null || event === void 0 ? void 0 : event.target) instanceof HTMLElement) {
                // prevents focus from highlighting around the modal
                event.target.blur();
            }
            onCycleThroughAttachments(1);
        }, shortcutRightConfig.descriptionKey, shortcutRightConfig.modifiers);
        return function () {
            unsubscribeLeftKey();
            unsubscribeRightKey();
        };
    }, [onCycleThroughAttachments]);
    return null;
}
exports.default = CarouselActions;
