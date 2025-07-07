"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
function HeaderGap(_a) {
    var styles = _a.styles;
    var themeStyles = (0, useThemeStyles_1.default)();
    return <react_native_1.View style={[themeStyles.headerGap, styles]}/>;
}
HeaderGap.displayName = 'HeaderGap';
exports.default = (0, react_1.memo)(HeaderGap);
