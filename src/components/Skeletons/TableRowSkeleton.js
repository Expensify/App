"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_svg_1 = require("react-native-svg");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var ItemListSkeletonView_1 = require("./ItemListSkeletonView");
var barHeight = '8';
var shortBarWidth = '60';
var longBarWidth = '124';
function TableListItemSkeleton(_a) {
    var _b = _a.shouldAnimate, shouldAnimate = _b === void 0 ? true : _b, fixedNumItems = _a.fixedNumItems, _c = _a.gradientOpacityEnabled, gradientOpacityEnabled = _c === void 0 ? false : _c;
    var styles = (0, useThemeStyles_1.default)();
    return (<ItemListSkeletonView_1.default shouldAnimate={shouldAnimate} fixedNumItems={fixedNumItems} gradientOpacityEnabled={gradientOpacityEnabled} itemViewStyle={[styles.highlightBG, styles.mb2, styles.br3, styles.ml5]} renderSkeletonItem={function () { return (<>
                    <react_native_svg_1.Circle cx="40" cy="32" r="20"/>
                    <react_native_svg_1.Rect x="80" y="20" width={longBarWidth} height={barHeight}/>
                    <react_native_svg_1.Rect x="80" y="36" width={shortBarWidth} height={barHeight}/>
                </>); }}/>);
}
TableListItemSkeleton.displayName = 'TableListItemSkeleton';
exports.default = TableListItemSkeleton;
