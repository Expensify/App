"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var Icon_1 = require("@components/Icon");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var variables_1 = require("@styles/variables");
function IconSection(_a) {
    var icon = _a.icon, iconContainerStyles = _a.iconContainerStyles, _b = _a.width, width = _b === void 0 ? variables_1.default.menuIconSize : _b, _c = _a.height, height = _c === void 0 ? variables_1.default.menuIconSize : _c;
    var styles = (0, useThemeStyles_1.default)();
    return (<react_native_1.View style={[styles.flexGrow1, styles.flexRow, styles.justifyContentEnd, iconContainerStyles]}>
            {!!icon && (<Icon_1.default src={icon} height={height} width={width}/>)}
        </react_native_1.View>);
}
IconSection.displayName = 'IconSection';
exports.default = IconSection;
