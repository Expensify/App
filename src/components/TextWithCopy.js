"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var ReportActionContextMenu_1 = require("@pages/home/report/ContextMenu/ReportActionContextMenu");
var CONST_1 = require("@src/CONST");
var PressableWithSecondaryInteraction_1 = require("./PressableWithSecondaryInteraction");
var Text_1 = require("./Text");
/**
 * A text component that copies the text to the clipboard when pressed.
 * This is different from the `copyValueToClipboard` component in that
 * here the copy functionality is incorporated into the text itself.
 * Long press this text to toggle the context menu containing the copy option.
 */
function TextWithCopy(_a) {
    var children = _a.children, copyValue = _a.copyValue, rest = __rest(_a, ["children", "copyValue"]);
    var popoverAnchor = (0, react_1.useRef)(null);
    var styles = (0, useThemeStyles_1.default)();
    var showCopyContextMenu = function (event) {
        if (!copyValue) {
            return;
        }
        (0, ReportActionContextMenu_1.showContextMenu)({
            type: CONST_1.default.CONTEXT_MENU_TYPES.TEXT,
            event: event,
            selection: copyValue,
            contextMenuAnchor: popoverAnchor.current,
        });
    };
    return (<PressableWithSecondaryInteraction_1.default ref={popoverAnchor} onSecondaryInteraction={showCopyContextMenu} accessibilityLabel={copyValue} accessible style={styles.cursorDefault}>
            <Text_1.default selectable={false} numberOfLines={1} 
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...rest}>
                {children}
            </Text_1.default>
        </PressableWithSecondaryInteraction_1.default>);
}
exports.default = TextWithCopy;
