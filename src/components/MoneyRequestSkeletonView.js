"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_svg_1 = require("react-native-svg");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var variables_1 = require("@styles/variables");
var SkeletonViewContentLoader_1 = require("./SkeletonViewContentLoader");
function MoneyRequestSkeletonView() {
    var theme = (0, useTheme_1.default)();
    var styles = (0, useThemeStyles_1.default)();
    return (<SkeletonViewContentLoader_1.default testID={MoneyRequestSkeletonView.displayName} animate width={styles.w100.width} height={variables_1.default.moneyRequestSkeletonHeight} backgroundColor={theme.skeletonLHNIn} foregroundColor={theme.skeletonLHNOut}>
            <react_native_svg_1.Rect x="16" y="20" width="40" height="8"/>
            <react_native_svg_1.Rect x="16" y="46" width="120" height="20"/>
            <react_native_svg_1.Rect x="16" y="78" width="80" height="8"/>
        </SkeletonViewContentLoader_1.default>);
}
MoneyRequestSkeletonView.displayName = 'MoneyRequestSkeletonView';
exports.default = MoneyRequestSkeletonView;
