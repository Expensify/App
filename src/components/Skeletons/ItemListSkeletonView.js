"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var SkeletonViewContentLoader_1 = require("@components/SkeletonViewContentLoader");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var CONST_1 = require("@src/CONST");
var getVerticalMargin = function (style) {
    var _a, _b, _c;
    if (!style) {
        return 0;
    }
    var flattenStyle = react_native_1.StyleSheet.flatten(style);
    var marginVertical = Number((_a = flattenStyle === null || flattenStyle === void 0 ? void 0 : flattenStyle.marginVertical) !== null && _a !== void 0 ? _a : 0);
    var marginTop = Number((_b = flattenStyle === null || flattenStyle === void 0 ? void 0 : flattenStyle.marginTop) !== null && _b !== void 0 ? _b : 0);
    var marginBottom = Number((_c = flattenStyle === null || flattenStyle === void 0 ? void 0 : flattenStyle.marginBottom) !== null && _c !== void 0 ? _c : 0);
    return marginVertical + marginTop + marginBottom;
};
function ItemListSkeletonView(_a) {
    var _b = _a.shouldAnimate, shouldAnimate = _b === void 0 ? true : _b, renderSkeletonItem = _a.renderSkeletonItem, fixedNumItems = _a.fixedNumItems, _c = _a.gradientOpacityEnabled, gradientOpacityEnabled = _c === void 0 ? false : _c, _d = _a.itemViewStyle, itemViewStyle = _d === void 0 ? {} : _d, _e = _a.itemViewHeight, itemViewHeight = _e === void 0 ? CONST_1.default.LHN_SKELETON_VIEW_ITEM_HEIGHT : _e, speed = _a.speed, style = _a.style;
    var theme = (0, useTheme_1.default)();
    var themeStyles = (0, useThemeStyles_1.default)();
    var _f = (0, react_1.useState)(fixedNumItems !== null && fixedNumItems !== void 0 ? fixedNumItems : 0), numItems = _f[0], setNumItems = _f[1];
    var totalItemHeight = itemViewHeight + getVerticalMargin(itemViewStyle);
    var handleLayout = (0, react_1.useCallback)(function (event) {
        if (fixedNumItems) {
            return;
        }
        var totalHeight = event.nativeEvent.layout.height;
        var newNumItems = Math.ceil(totalHeight / totalItemHeight);
        if (newNumItems !== numItems) {
            setNumItems(newNumItems);
        }
    }, [fixedNumItems, numItems, totalItemHeight]);
    var skeletonViewItems = (0, react_1.useMemo)(function () {
        var items = [];
        for (var i = 0; i < numItems; i++) {
            var opacity = gradientOpacityEnabled ? 1 - i / (numItems - 1) : 1;
            items.push(<SkeletonViewContentLoader_1.default speed={speed} key={"skeletonContainer".concat(i)} animate={shouldAnimate} height={itemViewHeight} backgroundColor={theme.skeletonLHNIn} foregroundColor={theme.skeletonLHNOut} style={[themeStyles.mr5, itemViewStyle, { opacity: opacity }, { minHeight: itemViewHeight }]}>
                    {renderSkeletonItem({ itemIndex: i })}
                </SkeletonViewContentLoader_1.default>);
        }
        return items;
    }, [numItems, shouldAnimate, theme, themeStyles, renderSkeletonItem, gradientOpacityEnabled, itemViewHeight, itemViewStyle, speed]);
    return (<react_native_1.View style={[themeStyles.flex1, style]} onLayout={handleLayout}>
            {skeletonViewItems}
        </react_native_1.View>);
}
ItemListSkeletonView.displayName = 'ListItemSkeleton';
exports.default = ItemListSkeletonView;
