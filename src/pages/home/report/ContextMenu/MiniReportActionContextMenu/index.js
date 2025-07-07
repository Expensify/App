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
var react_native_1 = require("react-native");
var useStyleUtils_1 = require("@hooks/useStyleUtils");
var BaseReportActionContextMenu_1 = require("@pages/home/report/ContextMenu/BaseReportActionContextMenu");
var CONST_1 = require("@src/CONST");
function MiniReportActionContextMenu(_a) {
    var _b;
    var _c;
    var _d = _a.displayAsGroup, displayAsGroup = _d === void 0 ? false : _d, rest = __rest(_a, ["displayAsGroup"]);
    var StyleUtils = (0, useStyleUtils_1.default)();
    return (<react_native_1.View style={StyleUtils.getMiniReportActionContextMenuWrapperStyle(displayAsGroup)} dataSet={_b = {}, _b[CONST_1.default.SELECTION_SCRAPER_HIDDEN_ELEMENT] = (_c = rest.isVisible) !== null && _c !== void 0 ? _c : false, _b}>
            <BaseReportActionContextMenu_1.default isMini 
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...rest}/>
        </react_native_1.View>);
}
MiniReportActionContextMenu.displayName = 'MiniReportActionContextMenu';
exports.default = MiniReportActionContextMenu;
