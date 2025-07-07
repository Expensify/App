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
var ReportActionContextMenu_1 = require("@pages/home/report/ContextMenu/ReportActionContextMenu");
var CONST_1 = require("@src/CONST");
var BaseQuickEmojiReactions_1 = require("./BaseQuickEmojiReactions");
function QuickEmojiReactions(_a) {
    var closeContextMenu = _a.closeContextMenu, rest = __rest(_a, ["closeContextMenu"]);
    var onPressOpenPicker = function (openPicker) {
        var _a;
        openPicker === null || openPicker === void 0 ? void 0 : openPicker((_a = ReportActionContextMenu_1.contextMenuRef.current) === null || _a === void 0 ? void 0 : _a.contentRef, {
            horizontal: CONST_1.default.MODAL.ANCHOR_ORIGIN_HORIZONTAL.RIGHT,
            vertical: CONST_1.default.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP,
        });
    };
    return (<BaseQuickEmojiReactions_1.default 
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...rest} onPressOpenPicker={onPressOpenPicker} onWillShowPicker={closeContextMenu}/>);
}
QuickEmojiReactions.displayName = 'QuickEmojiReactions';
exports.default = QuickEmojiReactions;
