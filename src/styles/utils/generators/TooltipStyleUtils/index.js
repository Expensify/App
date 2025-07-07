"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_native_1 = require("react-native");
var FontUtils_1 = require("@styles/utils/FontUtils");
// eslint-disable-next-line no-restricted-imports
var spacing_1 = require("@styles/utils/spacing");
// eslint-disable-next-line no-restricted-imports
var titleBarHeight_1 = require("@styles/utils/titleBarHeight");
var variables_1 = require("@styles/variables");
var CONST_1 = require("@src/CONST");
var computeHorizontalShift_1 = require("./computeHorizontalShift");
var isOverlappingAtTop_1 = require("./isOverlappingAtTop");
var tooltipPlatformStyles_1 = require("./tooltipPlatformStyles");
/** The height of a tooltip pointer */
var POINTER_HEIGHT = 4;
/** The width of a tooltip pointer */
var POINTER_WIDTH = 12;
/** The height of a education tooltip pointer */
var EDUCATION_POINTER_HEIGHT = 8;
/** The width of a education tooltip pointer */
var EDUCATION_POINTER_WIDTH = 16;
/**
 * Generate styles for the tooltip component.
 *
 * @param tooltip - The reference to the tooltip's root element
 * @param currentSize - The current size of the tooltip used in the scaling animation.
 * @param windowWidth - The width of the window.
 * @param xOffset - The distance between the left edge of the window
 *                           and the left edge of the wrapped component.
 * @param yOffset - The distance between the top edge of the window
 *                           and the top edge of the wrapped component.
 * @param tooltipTargetWidth - The width of the tooltip's target
 * @param tooltipTargetHeight - The height of the tooltip's target
 * @param maxWidth - The tooltip's max width.
 * @param tooltipContentWidth - The tooltip's inner content measured width.
 * @param tooltipWrapperHeight - The tooltip's wrapper measured height.
 * @param [manualShiftHorizontal] - Any additional amount to manually shift the tooltip to the left or right.
 *                                         A positive value shifts it to the right,
 *                                         and a negative value shifts it to the left.
 * @param [manualShiftVertical] - Any additional amount to manually shift the tooltip up or down.
 *                                       A positive value shifts it down, and a negative value shifts it up.
 * @param [shouldForceRenderingBelow] - Should display tooltip below the wrapped component.
 * @param [anchorAlignment] - Align tooltip anchor horizontally and vertically.
 * @param [wrapperStyle] - Any additional styles for the root wrapper.
 */
var createTooltipStyleUtils = function (_a) {
    var theme = _a.theme, styles = _a.styles;
    return ({
        getTooltipStyles: function (_a) {
            var _b;
            var tooltip = _a.tooltip, windowWidth = _a.windowWidth, xOffset = _a.xOffset, yOffset = _a.yOffset, tooltipTargetWidth = _a.tooltipTargetWidth, tooltipTargetHeight = _a.tooltipTargetHeight, maxWidth = _a.maxWidth, tooltipContentWidth = _a.tooltipContentWidth, tooltipWrapperHeight = _a.tooltipWrapperHeight, _c = _a.manualShiftHorizontal, manualShiftHorizontal = _c === void 0 ? 0 : _c, _d = _a.manualShiftVertical, manualShiftVertical = _d === void 0 ? 0 : _d, _e = _a.shouldAddHorizontalPadding, shouldAddHorizontalPadding = _e === void 0 ? true : _e, _f = _a.shouldForceRenderingBelow, shouldForceRenderingBelow = _f === void 0 ? false : _f, _g = _a.anchorAlignment, anchorAlignment = _g === void 0 ? {
                horizontal: CONST_1.default.MODAL.ANCHOR_ORIGIN_HORIZONTAL.CENTER,
                vertical: CONST_1.default.MODAL.ANCHOR_ORIGIN_VERTICAL.BOTTOM,
            } : _g, _h = _a.wrapperStyle, wrapperStyle = _h === void 0 ? {} : _h, _j = _a.isEducationTooltip, isEducationTooltip = _j === void 0 ? false : _j, _k = _a.computeHorizontalShiftForNative, computeHorizontalShiftForNative = _k === void 0 ? false : _k;
            var pointerWidth = isEducationTooltip ? EDUCATION_POINTER_WIDTH : POINTER_WIDTH;
            var pointerHeight = isEducationTooltip ? EDUCATION_POINTER_HEIGHT : POINTER_HEIGHT;
            var customWrapperStyle = react_native_1.StyleSheet.flatten(wrapperStyle);
            var tooltipVerticalPadding = spacing_1.default.pv1;
            var tooltipHorizontalPadding = shouldAddHorizontalPadding ? spacing_1.default.ph2.paddingHorizontal * 2 : 0;
            // We calculate tooltip width based on the tooltip's content width
            // so the tooltip wrapper is just big enough to fit content and prevent white space.
            // NOTE: Add 1 to the tooltipWidth to prevent truncated text in Safari
            var tooltipWidth = tooltipContentWidth && tooltipContentWidth + tooltipHorizontalPadding + 1;
            var tooltipHeight = tooltipWrapperHeight;
            var isTooltipSizeReady = tooltipWidth !== undefined && tooltipHeight !== undefined;
            var shouldShowBelow = false;
            var horizontalShift = 0;
            var horizontalShiftPointer = 0;
            var rootWrapperTop = 0;
            var rootWrapperLeft = 0;
            var pointerWrapperTop = 0;
            var pointerWrapperLeft = 0;
            var pointerAdditionalStyle = {};
            var opacity = 0;
            if (isTooltipSizeReady) {
                // Determine if the tooltip should display below the wrapped component.
                // If either a tooltip will try to render within GUTTER_WIDTH or desktop header logical pixels of the top of the screen,
                // Or the wrapped component is overlapping at top-center with another element
                // we'll display it beneath its wrapped component rather than above it as usual.
                shouldShowBelow =
                    shouldForceRenderingBelow ||
                        yOffset - tooltipHeight - pointerHeight < computeHorizontalShift_1.GUTTER_WIDTH + titleBarHeight_1.default ||
                        !!(tooltip && (0, isOverlappingAtTop_1.default)(tooltip, xOffset, yOffset, tooltipTargetWidth, tooltipTargetHeight)) ||
                        anchorAlignment.vertical === CONST_1.default.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP;
                // Because it uses fixed positioning, the top-left corner of the tooltip is aligned
                // with the top-left corner of the window by default.
                // we will use yOffset to position the tooltip relative to the Wrapped Component
                // So we need to shift the tooltip vertically and horizontally to position it correctly.
                //
                // First, we'll position it vertically.
                // To shift the tooltip down, we'll give `top` a positive value.
                // To shift the tooltip up, we'll give `top` a negative value.
                rootWrapperTop = shouldShowBelow
                    ? // We need to shift the tooltip down below the component. So shift the tooltip down (+) by...
                        yOffset + tooltipTargetHeight + pointerHeight + manualShiftVertical
                    : // We need to shift the tooltip up above the component. So shift the tooltip up (-) by...
                        yOffset - (tooltipHeight + pointerHeight) + manualShiftVertical;
                // By default, the pointer's top-left will align with the top-left of the tooltip wrapper.
                //
                // To align it vertically, we'll:
                //   If the pointer should be below the tooltip wrapper, shift the pointer down (+) by the tooltip height,
                //   so that the top of the pointer lines up with the bottom of the tooltip
                //
                //   OR if the pointer should be above the tooltip wrapper, then the pointer up (-) by the pointer's height
                //   so that the bottom of the pointer lines up with the top of the tooltip
                pointerWrapperTop = shouldShowBelow ? -pointerHeight : tooltipHeight;
                // Horizontal tooltip position:
                // we will use xOffset to position the tooltip relative to the Wrapped Component
                // To shift the tooltip right, we'll give `left` a positive value.
                // To shift the tooltip left, we'll give `left` a negative value.
                //
                // So we'll:
                //   1) Add the manual horizontal shift passed in as a parameter.
                //   2a) Horizontally align left: No need for shifting.
                //   2b) Horizontally align center:
                //      - Shift the tooltip right (+) to the center of the component,
                //        so the left edge lines up with the component center.
                //      - Shift it left (-) to by half the tooltip's width,
                //        so the tooltip's center lines up with the center of the wrapped component.
                // Horizontal pointer position:
                //   1) Left align: Shift the pointer to the right (+) by half the pointer's width,
                //      so the left edge of the pointer does not overlap with the wrapper's border radius.
                //   2) Center align:
                //      - Shift the pointer to the right (+) by the half the tooltipWidth's width,
                //        so the left edge of the pointer lines up with the tooltipWidth's center.
                //      - To the left (-) by half the pointer's width,
                //        so the pointer's center lines up with the tooltipWidth's center.
                //      - Remove the wrapper's horizontalShift to maintain the pointer
                //        at the center of the hovered component.
                rootWrapperLeft = xOffset + manualShiftHorizontal;
                switch (anchorAlignment.horizontal) {
                    case CONST_1.default.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT:
                        pointerWrapperLeft = pointerWidth / 2;
                        break;
                    case CONST_1.default.MODAL.ANCHOR_ORIGIN_HORIZONTAL.RIGHT:
                        pointerWrapperLeft = tooltipWidth - pointerWidth * 1.5;
                        rootWrapperLeft += tooltipTargetWidth - tooltipWidth;
                        break;
                    case CONST_1.default.MODAL.ANCHOR_ORIGIN_HORIZONTAL.CENTER:
                    default:
                        pointerWrapperLeft = tooltipWidth / 2 - pointerWidth / 2;
                        rootWrapperLeft += tooltipTargetWidth / 2 - tooltipWidth / 2;
                }
                // Determine if we need to shift the tooltip horizontally to prevent it
                // from displaying too near to the edge of the screen.
                horizontalShift = (0, computeHorizontalShift_1.default)(windowWidth, rootWrapperLeft, tooltipWidth, xOffset, tooltipTargetWidth, computeHorizontalShiftForNative);
                // Add the horizontal shift (left or right) computed above to keep it out of the gutters.
                rootWrapperLeft += horizontalShift;
                // Determine if we need to shift the pointer horizontally to prevent it from being too near to the edge of the tooltip
                // We shift it to the right a bit if the tooltip is positioned on the extreme left
                // and shift it to left a bit if the tooltip is positioned on the extreme right.
                horizontalShiftPointer =
                    horizontalShift > 0
                        ? Math.max(-horizontalShift, -(tooltipWidth / 2) + pointerWidth / 2 + variables_1.default.componentBorderRadiusSmall)
                        : Math.min(-horizontalShift, tooltipWidth / 2 - pointerWidth / 2 - variables_1.default.componentBorderRadiusSmall);
                // Horizontally align left: No need for shifting.
                pointerWrapperLeft += anchorAlignment.horizontal === CONST_1.default.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT ? 0 : horizontalShiftPointer;
                pointerAdditionalStyle = shouldShowBelow ? styles.flipUpsideDown : {};
                // React Native's measure() is asynchronous, we temporarily hide the tooltip until its bound is calculated
                opacity = 100;
            }
            return {
                rootWrapperStyle: __assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign({}, tooltipPlatformStyles_1.default), { backgroundColor: theme.heading, borderRadius: variables_1.default.componentBorderRadiusSmall }), tooltipVerticalPadding), spacing_1.default.ph2), { zIndex: variables_1.default.tooltipZIndex, width: tooltipWidth, maxWidth: maxWidth, top: rootWrapperTop, left: rootWrapperLeft, opacity: opacity }), customWrapperStyle), styles.userSelectNone), (!isEducationTooltip ? styles.pointerEventsNone : {})),
                textStyle: __assign(__assign({ color: theme.textReversed }, FontUtils_1.default.fontFamily.platform.EXP_NEUE), { fontSize: variables_1.default.fontSizeSmall, overflow: 'hidden', lineHeight: variables_1.default.lineHeightSmall, textAlign: 'center' }),
                pointerWrapperStyle: __assign(__assign({}, tooltipPlatformStyles_1.default), { top: pointerWrapperTop, left: pointerWrapperLeft, opacity: opacity }),
                pointerStyle: __assign({ width: 0, height: 0, backgroundColor: theme.transparent, borderStyle: 'solid', borderLeftWidth: pointerWidth / 2, borderRightWidth: pointerWidth / 2, borderTopWidth: pointerHeight, borderLeftColor: theme.transparent, borderRightColor: theme.transparent, borderTopColor: (_b = customWrapperStyle.backgroundColor) !== null && _b !== void 0 ? _b : theme.heading }, pointerAdditionalStyle),
            };
        },
        /** Utility function to create and manage scale animations with React Native Reanimated */
        getTooltipAnimatedStyles: function (props) {
            'worklet';
            var tooltipHorizontalPadding = spacing_1.default.ph2.paddingHorizontal * 2;
            var tooltipWidth = props.tooltipContentWidth && props.tooltipContentWidth + tooltipHorizontalPadding + 1;
            var isTooltipSizeReady = tooltipWidth !== undefined && props.tooltipWrapperHeight !== undefined;
            var scale = 0;
            if (isTooltipSizeReady) {
                scale = props.currentSize.get();
            }
            return {
                transform: [{ scale: scale }],
            };
        },
    });
};
exports.default = createTooltipStyleUtils;
