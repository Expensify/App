"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var react_native_svg_1 = require("react-native-svg");
var SkeletonViewContentLoader_1 = require("@components/SkeletonViewContentLoader");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
function TabNavigatorSkeleton() {
    var styles = (0, useThemeStyles_1.default)();
    var theme = (0, useTheme_1.default)();
    return (<react_native_1.View style={[styles.flexRow, styles.w100, styles.justifyContentBetween, styles.h10]}>
            <SkeletonViewContentLoader_1.default animate height={40} backgroundColor={theme.skeletonLHNIn} foregroundColor={theme.skeletonLHNOut} style={[styles.flex1, styles.ml4, styles.button, styles.highlightBG]}>
                <react_native_svg_1.Rect x="20%" y={13} width="60%" height={14}/>
            </SkeletonViewContentLoader_1.default>
            <SkeletonViewContentLoader_1.default animate height={40} backgroundColor={theme.skeletonLHNIn} foregroundColor={theme.skeletonLHNOut} style={[styles.flex1, styles.mr4, styles.button, styles.appBG]}>
                <react_native_svg_1.Rect x="20%" y={13} width="60%" height={14}/>
            </SkeletonViewContentLoader_1.default>
        </react_native_1.View>);
}
TabNavigatorSkeleton.displayName = 'TabNavigatorSkeleton';
exports.default = TabNavigatorSkeleton;
