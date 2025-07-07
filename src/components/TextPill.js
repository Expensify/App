"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
// eslint-disable-next-line no-restricted-imports
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var colors_1 = require("@styles/theme/colors");
var Text_1 = require("./Text");
function TextPill(_a) {
    var color = _a.color, textStyles = _a.textStyles, children = _a.children;
    var styles = (0, useThemeStyles_1.default)();
    return (<Text_1.default style={[{ backgroundColor: color !== null && color !== void 0 ? color : colors_1.default.red, borderRadius: 6 }, styles.overflowHidden, styles.textStrong, styles.ph2, styles.pv1, styles.flexShrink0, textStyles]}>
            {children}
        </Text_1.default>);
}
TextPill.displayName = 'TextPill';
exports.default = TextPill;
