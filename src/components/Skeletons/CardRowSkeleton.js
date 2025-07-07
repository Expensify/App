"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_svg_1 = require("react-native-svg");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var useWindowDimensions_1 = require("@hooks/useWindowDimensions");
var variables_1 = require("@styles/variables");
var ItemListSkeletonView_1 = require("./ItemListSkeletonView");
var barHeight = 7;
var longBarWidth = 120;
var shortBarWidth = 60;
var leftPaneWidth = variables_1.default.sideBarWithLHBWidth;
var gapWidth = 12;
var rightSideElementWidth = 50;
var centralPanePadding = 50;
var rightButtonWidth = 20;
function CardRowSkeleton(_a) {
    var _b = _a.shouldAnimate, shouldAnimate = _b === void 0 ? true : _b, fixedNumItems = _a.fixedNumItems, _c = _a.gradientOpacityEnabled, gradientOpacityEnabled = _c === void 0 ? false : _c;
    var styles = (0, useThemeStyles_1.default)();
    var windowWidth = (0, useWindowDimensions_1.default)().windowWidth;
    var shouldUseNarrowLayout = (0, useResponsiveLayout_1.default)().shouldUseNarrowLayout;
    return (<ItemListSkeletonView_1.default shouldAnimate={shouldAnimate} fixedNumItems={fixedNumItems} gradientOpacityEnabled={gradientOpacityEnabled} itemViewStyle={[styles.highlightBG, styles.mb3, styles.br3, styles.ml5]} renderSkeletonItem={function () { return (<>
                    <react_native_svg_1.Circle cx={36} cy={32} r={20}/>
                    <react_native_svg_1.Rect x={66} y={22} width={longBarWidth} height={barHeight}/>

                    <react_native_svg_1.Rect x={66} y={36} width={shortBarWidth} height={barHeight}/>

                    {!shouldUseNarrowLayout && (<>
                            <react_native_svg_1.Rect 
            // We have to calculate this value to make sure the element is aligned to the button on the right side.
            x={windowWidth - leftPaneWidth - rightButtonWidth - gapWidth - centralPanePadding - gapWidth - rightSideElementWidth} y={28} width={20} height={barHeight}/>

                            <react_native_svg_1.Rect 
            // We have to calculate this value to make sure the element is aligned to the right border.
            x={windowWidth - leftPaneWidth - rightSideElementWidth - gapWidth - centralPanePadding} y={28} width={50} height={barHeight}/>
                        </>)}
                </>); }}/>);
}
CardRowSkeleton.displayName = 'CardRowSkeleton';
exports.default = CardRowSkeleton;
