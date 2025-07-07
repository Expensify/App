"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_reanimated_1 = require("react-native-reanimated");
var useLocalize_1 = require("@hooks/useLocalize");
var usePrevious_1 = require("@hooks/usePrevious");
var useWindowDimensions_1 = require("@hooks/useWindowDimensions");
var Log_1 = require("@libs/Log");
var StringUtils_1 = require("@libs/StringUtils");
var variables_1 = require("@styles/variables");
var CONST_1 = require("@src/CONST");
var callOrReturn_1 = require("@src/types/utils/callOrReturn");
var BaseGenericTooltip_1 = require("./BaseGenericTooltip");
var TooltipSense_1 = require("./TooltipSense");
/**
 * The generic tooltip implementation, exposing the tooltip's state
 * while leaving the tooltip's target bounds computation to its parent.
 */
function GenericTooltip(_a) {
    var children = _a.children, _b = _a.numberOfLines, numberOfLines = _b === void 0 ? CONST_1.default.TOOLTIP_MAX_LINES : _b, _c = _a.maxWidth, maxWidth = _c === void 0 ? variables_1.default.sideBarWidth - 2 * variables_1.default.uploadViewMargin : _c, _d = _a.text, text = _d === void 0 ? '' : _d, renderTooltipContent = _a.renderTooltipContent, _e = _a.renderTooltipContentKey, renderTooltipContentKey = _e === void 0 ? [] : _e, _f = _a.shiftHorizontal, shiftHorizontal = _f === void 0 ? 0 : _f, _g = _a.shiftVertical, shiftVertical = _g === void 0 ? 0 : _g, _h = _a.shouldForceRenderingBelow, shouldForceRenderingBelow = _h === void 0 ? false : _h, _j = _a.wrapperStyle, wrapperStyle = _j === void 0 ? {} : _j, _k = _a.anchorAlignment, anchorAlignment = _k === void 0 ? {
        horizontal: CONST_1.default.MODAL.ANCHOR_ORIGIN_HORIZONTAL.CENTER,
        vertical: CONST_1.default.MODAL.ANCHOR_ORIGIN_VERTICAL.BOTTOM,
    } : _k, _l = _a.shouldForceAnimate, shouldForceAnimate = _l === void 0 ? false : _l, _m = _a.shouldUseOverlay, shouldUseOverlayProp = _m === void 0 ? false : _m, shouldTeleportPortalToModalLayer = _a.shouldTeleportPortalToModalLayer, _o = _a.shouldRender, shouldRender = _o === void 0 ? true : _o, _p = _a.isEducationTooltip, isEducationTooltip = _p === void 0 ? false : _p, onTooltipPress = _a.onTooltipPress, _q = _a.computeHorizontalShiftForNative, computeHorizontalShiftForNative = _q === void 0 ? false : _q;
    var preferredLocale = (0, useLocalize_1.default)().preferredLocale;
    var windowWidth = (0, useWindowDimensions_1.default)().windowWidth;
    // Is tooltip already rendered on the page's body? happens once.
    var _r = (0, react_1.useState)(false), isRendered = _r[0], setIsRendered = _r[1];
    // Is the tooltip currently visible?
    var _s = (0, react_1.useState)(false), isVisible = _s[0], setIsVisible = _s[1];
    // The distance between the left side of the wrapper view and the left side of the window
    var _t = (0, react_1.useState)(0), xOffset = _t[0], setXOffset = _t[1];
    // The distance between the top of the wrapper view and the top of the window
    var _u = (0, react_1.useState)(0), yOffset = _u[0], setYOffset = _u[1];
    // The width and height of the wrapper view
    var _v = (0, react_1.useState)(0), wrapperWidth = _v[0], setWrapperWidth = _v[1];
    var _w = (0, react_1.useState)(0), wrapperHeight = _w[0], setWrapperHeight = _w[1];
    // Transparent overlay should disappear once user taps it
    var _x = (0, react_1.useState)(shouldUseOverlayProp), shouldUseOverlay = _x[0], setShouldUseOverlay = _x[1];
    // Whether the tooltip is first tooltip to activate the TooltipSense
    var animation = (0, react_native_reanimated_1.useSharedValue)(0);
    var isTooltipSenseInitiator = (0, react_native_reanimated_1.useSharedValue)(true);
    var isAnimationCanceled = (0, react_native_reanimated_1.useSharedValue)(false);
    var prevText = (0, usePrevious_1.default)(text);
    (0, react_1.useEffect)(function () {
        if (!renderTooltipContent || !text) {
            return;
        }
        Log_1.default.warn('Developer error: Cannot use both text and renderTooltipContent props at the same time in <TooltipRenderedOnPageBody />!');
    }, [text, renderTooltipContent]);
    /**
     * Display the tooltip in an animation.
     */
    var showTooltip = (0, react_1.useCallback)(function () {
        setIsRendered(true);
        setIsVisible(true);
        (0, react_native_reanimated_1.cancelAnimation)(animation);
        // When TooltipSense is active, immediately show the tooltip
        if (TooltipSense_1.default.isActive() && !shouldForceAnimate) {
            animation.set(1);
        }
        else {
            isTooltipSenseInitiator.set(true);
            animation.set((0, react_native_reanimated_1.withDelay)(500, (0, react_native_reanimated_1.withTiming)(1, {
                duration: 140,
            }, function (finished) {
                isAnimationCanceled.set(!finished);
            })));
        }
        TooltipSense_1.default.activate();
    }, [animation, isAnimationCanceled, isTooltipSenseInitiator, shouldForceAnimate]);
    // eslint-disable-next-line rulesdir/prefer-early-return
    (0, react_1.useEffect)(function () {
        // if the tooltip text changed before the initial animation was finished, then the tooltip won't be shown
        // we need to show the tooltip again
        if (isVisible && isAnimationCanceled.get() && text && prevText !== text) {
            isAnimationCanceled.set(false);
            showTooltip();
        }
    }, [isVisible, text, prevText, showTooltip, isAnimationCanceled]);
    /**
     * Update the tooltip's target bounding rectangle
     */
    var updateTargetBounds = function (bounds) {
        if (bounds.width === 0) {
            setIsRendered(false);
        }
        setWrapperWidth(bounds.width);
        setWrapperHeight(bounds.height);
        setXOffset(bounds.x);
        setYOffset(bounds.y);
    };
    /**
     * Hide the tooltip in an animation.
     */
    var hideTooltip = (0, react_1.useCallback)(function () {
        (0, react_native_reanimated_1.cancelAnimation)(animation);
        if (TooltipSense_1.default.isActive() && !isTooltipSenseInitiator.get()) {
            // eslint-disable-next-line react-compiler/react-compiler
            animation.set(0);
        }
        else {
            // Hide the first tooltip which initiated the TooltipSense with animation
            isTooltipSenseInitiator.set(false);
            animation.set(0);
        }
        TooltipSense_1.default.deactivate();
        setIsVisible(false);
    }, [animation, isTooltipSenseInitiator]);
    var onPressOverlay = (0, react_1.useCallback)(function () {
        if (!shouldUseOverlay) {
            return;
        }
        setShouldUseOverlay(false);
        hideTooltip();
    }, [shouldUseOverlay, hideTooltip]);
    // Skip the tooltip and return the children if the text is empty, we don't have a render function.
    if (StringUtils_1.default.isEmptyString(text) && renderTooltipContent == null) {
        // eslint-disable-next-line react-compiler/react-compiler
        return children({ isVisible: isVisible, showTooltip: showTooltip, hideTooltip: hideTooltip, updateTargetBounds: updateTargetBounds });
    }
    return (<>
            {shouldRender && isRendered && (<BaseGenericTooltip_1.default isEducationTooltip={isEducationTooltip} 
        // eslint-disable-next-line react-compiler/react-compiler
        animation={animation} windowWidth={windowWidth} xOffset={xOffset} yOffset={yOffset} targetWidth={wrapperWidth} targetHeight={wrapperHeight} shiftHorizontal={(0, callOrReturn_1.default)(shiftHorizontal)} shiftVertical={(0, callOrReturn_1.default)(shiftVertical)} text={text} maxWidth={maxWidth} numberOfLines={numberOfLines} renderTooltipContent={renderTooltipContent} 
        // We pass a key, so whenever the content changes this component will completely remount with a fresh state.
        // This prevents flickering/moving while remaining performant.
        key={__spreadArray(__spreadArray([text], renderTooltipContentKey, true), [preferredLocale], false).join('-')} shouldForceRenderingBelow={shouldForceRenderingBelow} wrapperStyle={wrapperStyle} anchorAlignment={anchorAlignment} shouldUseOverlay={shouldUseOverlay} shouldTeleportPortalToModalLayer={shouldTeleportPortalToModalLayer} onHideTooltip={onPressOverlay} onTooltipPress={onTooltipPress} computeHorizontalShiftForNative={computeHorizontalShiftForNative}/>)}
            {/* eslint-disable-next-line react-compiler/react-compiler */}
            {children({ isVisible: isVisible, showTooltip: showTooltip, hideTooltip: hideTooltip, updateTargetBounds: updateTargetBounds })}
        </>);
}
GenericTooltip.displayName = 'GenericTooltip';
exports.default = (0, react_1.memo)(GenericTooltip);
