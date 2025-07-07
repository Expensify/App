"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var react_native_svg_1 = require("react-native-svg");
var SkeletonViewContentLoader_1 = require("@components/SkeletonViewContentLoader");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
function SearchFiltersSkeleton(_a) {
    var _b = _a.shouldAnimate, shouldAnimate = _b === void 0 ? true : _b;
    var theme = (0, useTheme_1.default)();
    var styles = (0, useThemeStyles_1.default)();
    var skeletonCount = new Array(5).fill(0);
    return (<react_native_1.View style={[styles.mh5, styles.mb4, styles.mt2]}>
            <SkeletonViewContentLoader_1.default animate={shouldAnimate} height={28} backgroundColor={theme.skeletonLHNIn} foregroundColor={theme.skeletonLHNOut}>
                {skeletonCount.map(function (_, index) { return (<react_native_svg_1.Rect 
        // eslint-disable-next-line react/no-array-index-key
        key={index} x={index * 90} y={0} rx={14} ry={14} width={84} height={28}/>); })}
            </SkeletonViewContentLoader_1.default>

            <react_native_1.View style={[styles.pAbsolute, styles.w100]}>
                <SkeletonViewContentLoader_1.default animate={shouldAnimate} height={40} backgroundColor={theme.hoverComponentBG} foregroundColor={theme.buttonHoveredBG}>
                    {skeletonCount.map(function (_, index) { return (<react_native_svg_1.Rect 
        // eslint-disable-next-line react/no-array-index-key
        key={index} x={12 + index * 90} y={10} width={60} height={8}/>); })}
                </SkeletonViewContentLoader_1.default>
            </react_native_1.View>
        </react_native_1.View>);
}
SearchFiltersSkeleton.displayName = 'SearchStatusSkeleton';
exports.default = SearchFiltersSkeleton;
