"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_svg_1 = require("react-native-svg");
var SkeletonViewContentLoader_1 = require("@components/SkeletonViewContentLoader");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var CONST_1 = require("@src/CONST");
function SkeletonViewLines(_a) {
    var numberOfRows = _a.numberOfRows, _b = _a.shouldAnimate, shouldAnimate = _b === void 0 ? true : _b;
    var theme = (0, useTheme_1.default)();
    var styles = (0, useThemeStyles_1.default)();
    return (<SkeletonViewContentLoader_1.default animate={shouldAnimate} height={CONST_1.default.CHAT_SKELETON_VIEW.HEIGHT_FOR_ROW_COUNT[numberOfRows]} backgroundColor={theme.skeletonLHNIn} foregroundColor={theme.skeletonLHNOut} speed={CONST_1.default.TIMING.SKELETON_ANIMATION_SPEED} style={styles.mr5}>
            <react_native_svg_1.Circle cx="40" cy="26" r="20"/>
            <react_native_svg_1.Rect x="72" y="11" width="20%" height="8"/>
            <react_native_svg_1.Rect x="72" y="31" width="100%" height="8"/>
            {numberOfRows > 1 && (<react_native_svg_1.Rect x="72" y="51" width="50%" height="8"/>)}
            {numberOfRows > 2 && (<react_native_svg_1.Rect x="72" y="71" width="50%" height="8"/>)}
        </SkeletonViewContentLoader_1.default>);
}
SkeletonViewLines.displayName = 'SkeletonViewLines';
exports.default = SkeletonViewLines;
