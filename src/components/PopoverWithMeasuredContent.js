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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var fast_equals_1 = require("fast-equals");
var react_1 = require("react");
var react_native_1 = require("react-native");
var usePrevious_1 = require("@hooks/usePrevious");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var useWindowDimensions_1 = require("@hooks/useWindowDimensions");
var ComposerFocusManager_1 = require("@libs/ComposerFocusManager");
var PopoverWithMeasuredContentUtils_1 = require("@libs/PopoverWithMeasuredContentUtils");
var CONST_1 = require("@src/CONST");
var ActionSheetAwareScrollView = require("./ActionSheetAwareScrollView");
var Popover_1 = require("./Popover");
/**
 * This is a convenient wrapper around the regular Popover component that allows us to use a more sophisticated
 * positioning schema responsively (without having to provide a static width and height for the popover content).
 * This way, we can shift the position of popover so that the content is anchored where we want it relative to the
 * anchor position.
 */
function PopoverWithMeasuredContent(_a) {
    var _b = _a.popoverDimensions, popoverDimensions = _b === void 0 ? {
        height: 0,
        width: 0,
    } : _b, anchorPosition = _a.anchorPosition, isVisible = _a.isVisible, _c = _a.anchorAlignment, anchorAlignment = _c === void 0 ? {
        horizontal: CONST_1.default.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT,
        vertical: CONST_1.default.MODAL.ANCHOR_ORIGIN_VERTICAL.BOTTOM,
    } : _c, children = _a.children, _d = _a.withoutOverlay, withoutOverlay = _d === void 0 ? false : _d, _e = _a.fullscreen, fullscreen = _e === void 0 ? true : _e, _f = _a.shouldCloseOnOutsideClick, shouldCloseOnOutsideClick = _f === void 0 ? false : _f, _g = _a.shouldSetModalVisibility, shouldSetModalVisibility = _g === void 0 ? true : _g, _h = _a.statusBarTranslucent, statusBarTranslucent = _h === void 0 ? true : _h, _j = _a.navigationBarTranslucent, navigationBarTranslucent = _j === void 0 ? true : _j, _k = _a.avoidKeyboard, avoidKeyboard = _k === void 0 ? false : _k, _l = _a.hideModalContentWhileAnimating, hideModalContentWhileAnimating = _l === void 0 ? false : _l, _m = _a.anchorDimensions, anchorDimensions = _m === void 0 ? {
        height: 0,
        width: 0,
    } : _m, _o = _a.shouldSwitchPositionIfOverflow, shouldSwitchPositionIfOverflow = _o === void 0 ? false : _o, _p = _a.shouldHandleNavigationBack, shouldHandleNavigationBack = _p === void 0 ? false : _p, shouldEnableNewFocusManagement = _a.shouldEnableNewFocusManagement, _q = _a.shouldMeasureAnchorPositionFromTop, shouldMeasureAnchorPositionFromTop = _q === void 0 ? false : _q, _r = _a.shouldSkipRemeasurement, shouldSkipRemeasurement = _r === void 0 ? false : _r, props = __rest(_a, ["popoverDimensions", "anchorPosition", "isVisible", "anchorAlignment", "children", "withoutOverlay", "fullscreen", "shouldCloseOnOutsideClick", "shouldSetModalVisibility", "statusBarTranslucent", "navigationBarTranslucent", "avoidKeyboard", "hideModalContentWhileAnimating", "anchorDimensions", "shouldSwitchPositionIfOverflow", "shouldHandleNavigationBack", "shouldEnableNewFocusManagement", "shouldMeasureAnchorPositionFromTop", "shouldSkipRemeasurement"]);
    var actionSheetAwareScrollViewContext = (0, react_1.useContext)(ActionSheetAwareScrollView.ActionSheetAwareScrollViewContext);
    var styles = (0, useThemeStyles_1.default)();
    var _s = (0, useWindowDimensions_1.default)(), windowWidth = _s.windowWidth, windowHeight = _s.windowHeight;
    var _t = (0, react_1.useState)(popoverDimensions.width), popoverWidth = _t[0], setPopoverWidth = _t[1];
    var _u = (0, react_1.useState)(popoverDimensions.height), popoverHeight = _u[0], setPopoverHeight = _u[1];
    var _v = (0, react_1.useState)(popoverWidth > 0 && popoverHeight > 0), isContentMeasured = _v[0], setIsContentMeasured = _v[1];
    var prevIsVisible = (0, usePrevious_1.default)(isVisible);
    var prevAnchorPosition = (0, usePrevious_1.default)(anchorPosition);
    var prevWindowDimensions = (0, usePrevious_1.default)({ windowWidth: windowWidth, windowHeight: windowHeight });
    var modalId = (0, react_1.useMemo)(function () { return ComposerFocusManager_1.default.getId(); }, []);
    if (!prevIsVisible && isVisible && shouldEnableNewFocusManagement) {
        ComposerFocusManager_1.default.saveFocusState(modalId);
    }
    if (!prevIsVisible && isVisible && isContentMeasured && !shouldSkipRemeasurement) {
        // Check if anything significant changed that would require re-measurement
        var hasAnchorPositionChanged = !(0, fast_equals_1.deepEqual)(prevAnchorPosition, anchorPosition);
        var hasWindowSizeChanged = !(0, fast_equals_1.deepEqual)(prevWindowDimensions, { windowWidth: windowWidth, windowHeight: windowHeight });
        var hasStaticDimensions = popoverDimensions.width > 0 && popoverDimensions.height > 0;
        // Only reset if:
        // 1. We don't have static dimensions, OR
        // 2. The anchor position changed significantly, OR
        // 3. The window size changed significantly
        if (!hasStaticDimensions || hasAnchorPositionChanged || hasWindowSizeChanged) {
            setIsContentMeasured(false);
        }
    }
    /**
     * Measure the size of the popover's content.
     */
    var measurePopover = function (_a) {
        var _b;
        var nativeEvent = _a.nativeEvent;
        var _c = nativeEvent.layout, width = _c.width, height = _c.height;
        setPopoverWidth(width);
        setPopoverHeight(height);
        setIsContentMeasured(true);
        // it handles the case when `measurePopover` is called with values like: 192, 192.00003051757812, 192
        // if we update it, then animation in `ActionSheetAwareScrollView` may be re-running
        // and we'll see out-of-sync and junky animation
        if (((_b = actionSheetAwareScrollViewContext.currentActionSheetState.get().current.payload) === null || _b === void 0 ? void 0 : _b.popoverHeight) !== Math.floor(height) && height !== 0) {
            actionSheetAwareScrollViewContext.transitionActionSheetState({
                type: ActionSheetAwareScrollView.Actions.MEASURE_POPOVER,
                payload: {
                    popoverHeight: Math.floor(height),
                },
            });
        }
    };
    var adjustedAnchorPosition = (0, react_1.useMemo)(function () {
        var horizontalConstraint;
        switch (anchorAlignment.horizontal) {
            case CONST_1.default.MODAL.ANCHOR_ORIGIN_HORIZONTAL.RIGHT:
                horizontalConstraint = { left: anchorPosition.horizontal - popoverWidth };
                break;
            case CONST_1.default.MODAL.ANCHOR_ORIGIN_HORIZONTAL.CENTER:
                horizontalConstraint = {
                    left: Math.floor(anchorPosition.horizontal - popoverWidth / 2),
                };
                break;
            case CONST_1.default.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT:
            default:
                horizontalConstraint = { left: anchorPosition.horizontal };
        }
        var verticalConstraint;
        switch (anchorAlignment.vertical) {
            case CONST_1.default.MODAL.ANCHOR_ORIGIN_VERTICAL.BOTTOM:
                verticalConstraint = { top: anchorPosition.vertical - popoverHeight };
                break;
            case CONST_1.default.MODAL.ANCHOR_ORIGIN_VERTICAL.CENTER:
                verticalConstraint = {
                    top: Math.floor(anchorPosition.vertical - popoverHeight / 2),
                };
                break;
            case CONST_1.default.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP:
            default:
                verticalConstraint = { top: anchorPosition.vertical };
        }
        return __assign(__assign({}, horizontalConstraint), verticalConstraint);
    }, [anchorPosition, anchorAlignment, popoverWidth, popoverHeight]);
    var positionCalculations = (0, react_1.useMemo)(function () {
        var horizontalShift = PopoverWithMeasuredContentUtils_1.default.computeHorizontalShift(adjustedAnchorPosition.left, popoverWidth, windowWidth);
        var verticalShift = PopoverWithMeasuredContentUtils_1.default.computeVerticalShift(adjustedAnchorPosition.top, popoverHeight, windowHeight, anchorDimensions.height, shouldSwitchPositionIfOverflow);
        return { horizontalShift: horizontalShift, verticalShift: verticalShift };
    }, [adjustedAnchorPosition.left, adjustedAnchorPosition.top, popoverWidth, popoverHeight, windowWidth, windowHeight, anchorDimensions.height, shouldSwitchPositionIfOverflow]);
    var shiftedAnchorPosition = (0, react_1.useMemo)(function () {
        var result = {
            left: adjustedAnchorPosition.left + positionCalculations.horizontalShift,
        };
        if (shouldMeasureAnchorPositionFromTop) {
            result.top = adjustedAnchorPosition.top + positionCalculations.verticalShift;
        }
        if (anchorAlignment.vertical === CONST_1.default.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP) {
            var top_1 = adjustedAnchorPosition.top + positionCalculations.verticalShift;
            var maxTop = windowHeight - popoverHeight - positionCalculations.verticalShift;
            result.top = Math.min(Math.max(positionCalculations.verticalShift, top_1), maxTop);
        }
        if (anchorAlignment.vertical === CONST_1.default.MODAL.ANCHOR_ORIGIN_VERTICAL.BOTTOM) {
            result.bottom = windowHeight - (adjustedAnchorPosition.top + popoverHeight) - positionCalculations.verticalShift;
        }
        return result;
    }, [adjustedAnchorPosition, positionCalculations, anchorAlignment.vertical, windowHeight, popoverHeight, shouldMeasureAnchorPositionFromTop]);
    return isContentMeasured ? (<Popover_1.default shouldHandleNavigationBack={shouldHandleNavigationBack} popoverDimensions={{ height: popoverHeight, width: popoverWidth }} anchorAlignment={anchorAlignment} isVisible={isVisible} withoutOverlay={withoutOverlay} fullscreen={fullscreen} shouldCloseOnOutsideClick={shouldCloseOnOutsideClick} shouldSetModalVisibility={shouldSetModalVisibility} statusBarTranslucent={statusBarTranslucent} navigationBarTranslucent={navigationBarTranslucent} avoidKeyboard={avoidKeyboard} hideModalContentWhileAnimating={hideModalContentWhileAnimating} modalId={modalId} shouldEnableNewFocusManagement={shouldEnableNewFocusManagement} 
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...props} anchorPosition={shiftedAnchorPosition}>
            <react_native_1.View onLayout={measurePopover}>{children}</react_native_1.View>
        </Popover_1.default>) : (
    /*
  This is an invisible view used to measure the size of the popover,
  before it ever needs to be displayed.
  We do this because we need to know its dimensions in order to correctly animate the popover,
  but we can't measure its dimensions without first rendering it.
*/
    <react_native_1.View style={styles.invisiblePopover} onLayout={measurePopover}>
            {children}
        </react_native_1.View>);
}
PopoverWithMeasuredContent.displayName = 'PopoverWithMeasuredContent';
exports.default = react_1.default.memo(PopoverWithMeasuredContent, function (prevProps, nextProps) {
    if (prevProps.isVisible === nextProps.isVisible && nextProps.isVisible === false) {
        return true;
    }
    return (0, fast_equals_1.circularDeepEqual)(prevProps, nextProps);
});
