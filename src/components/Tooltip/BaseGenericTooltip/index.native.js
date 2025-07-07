"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var portal_1 = require("@gorhom/portal");
var react_1 = require("react");
var react_native_1 = require("react-native");
var react_native_reanimated_1 = require("react-native-reanimated");
var AnimatedPressableWithoutFeedback_1 = require("@components/AnimatedPressableWithoutFeedback");
var TransparentOverlay_1 = require("@components/AutoCompleteSuggestions/AutoCompleteSuggestionsPortal/TransparentOverlay/TransparentOverlay");
var Text_1 = require("@components/Text");
var useStyleUtils_1 = require("@hooks/useStyleUtils");
var Fullstory_1 = require("@libs/Fullstory");
var CONST_1 = require("@src/CONST");
// Props will change frequently.
// On every tooltip hover, we update the position in state which will result in re-rendering.
// We also update the state on layout changes which will be triggered often.
// There will be n number of tooltip components in the page.
// It's good to memoize this one.
function BaseGenericTooltip(_a) {
    var animation = _a.animation, windowWidth = _a.windowWidth, xOffset = _a.xOffset, yOffset = _a.yOffset, targetWidth = _a.targetWidth, targetHeight = _a.targetHeight, _b = _a.shiftHorizontal, shiftHorizontal = _b === void 0 ? 0 : _b, _c = _a.shiftVertical, shiftVertical = _c === void 0 ? 0 : _c, text = _a.text, numberOfLines = _a.numberOfLines, _d = _a.maxWidth, maxWidth = _d === void 0 ? 0 : _d, renderTooltipContent = _a.renderTooltipContent, _e = _a.shouldForceRenderingBelow, shouldForceRenderingBelow = _e === void 0 ? false : _e, _f = _a.anchorAlignment, anchorAlignment = _f === void 0 ? {
        horizontal: CONST_1.default.MODAL.ANCHOR_ORIGIN_HORIZONTAL.CENTER,
        vertical: CONST_1.default.MODAL.ANCHOR_ORIGIN_VERTICAL.BOTTOM,
    } : _f, _g = _a.wrapperStyle, wrapperStyle = _g === void 0 ? {} : _g, _h = _a.shouldUseOverlay, shouldUseOverlay = _h === void 0 ? false : _h, _j = _a.onHideTooltip, onHideTooltip = _j === void 0 ? function () { } : _j, _k = _a.shouldTeleportPortalToModalLayer, shouldTeleportPortalToModalLayer = _k === void 0 ? false : _k, _l = _a.isEducationTooltip, isEducationTooltip = _l === void 0 ? false : _l, _m = _a.onTooltipPress, onTooltipPress = _m === void 0 ? function () { } : _m, _o = _a.computeHorizontalShiftForNative, computeHorizontalShiftForNative = _o === void 0 ? false : _o;
    // The width of tooltip's inner content. Has to be undefined in the beginning
    // as a width of 0 will cause the content to be rendered of a width of 0,
    // which prevents us from measuring it correctly.
    var _p = (0, react_1.useState)(), contentMeasuredWidthState = _p[0], setContentMeasuredWidth = _p[1];
    var contentMeasuredWidthAnimated = (0, react_native_reanimated_1.useSharedValue)(0);
    // The height of tooltip's wrapper.
    var _q = (0, react_1.useState)(), wrapperMeasuredHeightState = _q[0], setWrapperMeasuredHeight = _q[1];
    var wrapperMeasuredHeightAnimated = (0, react_native_reanimated_1.useSharedValue)(0);
    var rootWrapper = (0, react_1.useRef)(null);
    var StyleUtils = (0, useStyleUtils_1.default)();
    var _r = (0, react_1.useMemo)(function () {
        return StyleUtils.getTooltipStyles({
            // eslint-disable-next-line react-compiler/react-compiler
            tooltip: rootWrapper.current,
            windowWidth: windowWidth,
            xOffset: xOffset,
            yOffset: yOffset,
            tooltipTargetWidth: targetWidth,
            tooltipTargetHeight: targetHeight,
            maxWidth: maxWidth,
            tooltipContentWidth: contentMeasuredWidthState,
            tooltipWrapperHeight: wrapperMeasuredHeightState,
            manualShiftHorizontal: shiftHorizontal,
            manualShiftVertical: shiftVertical,
            shouldForceRenderingBelow: shouldForceRenderingBelow,
            anchorAlignment: anchorAlignment,
            wrapperStyle: wrapperStyle,
            shouldAddHorizontalPadding: false,
            isEducationTooltip: isEducationTooltip,
            computeHorizontalShiftForNative: computeHorizontalShiftForNative,
        });
    }, [
        StyleUtils,
        windowWidth,
        xOffset,
        yOffset,
        targetWidth,
        targetHeight,
        maxWidth,
        contentMeasuredWidthState,
        wrapperMeasuredHeightState,
        shiftHorizontal,
        shiftVertical,
        shouldForceRenderingBelow,
        anchorAlignment,
        wrapperStyle,
        isEducationTooltip,
        computeHorizontalShiftForNative,
    ]), rootWrapperStyle = _r.rootWrapperStyle, textStyle = _r.textStyle, pointerWrapperStyle = _r.pointerWrapperStyle, pointerStyle = _r.pointerStyle;
    var animationStyle = (0, react_native_reanimated_1.useAnimatedStyle)(function () {
        return StyleUtils.getTooltipAnimatedStyles({
            tooltipContentWidth: contentMeasuredWidthAnimated.get(),
            tooltipWrapperHeight: wrapperMeasuredHeightAnimated.get(),
            currentSize: animation,
        });
    });
    /**
     * Extracts values from the non-scraped attribute WEB_PROP_ATTR at build time
     * to ensure necessary properties are available for further processing.
     * Reevaluates "fs-class" to dynamically apply styles or behavior based on
     * updated attribute values.
     */
    (0, react_1.useLayoutEffect)(Fullstory_1.parseFSAttributes, []);
    var content;
    if (renderTooltipContent) {
        content = (<react_native_1.View fsClass={CONST_1.default.FULL_STORY.UNMASK} testID={CONST_1.default.FULL_STORY.UNMASK}>
                {renderTooltipContent()}
            </react_native_1.View>);
    }
    else {
        content = (<Text_1.default numberOfLines={numberOfLines} style={textStyle} fsClass={CONST_1.default.FULL_STORY.UNMASK} testID={CONST_1.default.FULL_STORY.UNMASK}>
                <Text_1.default style={textStyle}>{text}</Text_1.default>
            </Text_1.default>);
    }
    var AnimatedWrapper = isEducationTooltip ? AnimatedPressableWithoutFeedback_1.default : react_native_reanimated_1.default.View;
    return (<portal_1.Portal hostName={shouldTeleportPortalToModalLayer ? 'modal' : undefined}>
            {shouldUseOverlay && <TransparentOverlay_1.default onPress={onHideTooltip}/>}
            <AnimatedWrapper style={[rootWrapperStyle, animationStyle]} ref={rootWrapper} onPress={isEducationTooltip ? onTooltipPress : undefined} role={isEducationTooltip ? CONST_1.default.ROLE.TOOLTIP : undefined} accessibilityLabel={isEducationTooltip ? CONST_1.default.ROLE.TOOLTIP : undefined} onLayout={function (e) {
            var _a = e.nativeEvent.layout, height = _a.height, width = _a.width;
            if (height === wrapperMeasuredHeightAnimated.get()) {
                return;
            }
            // To avoid unnecessary re-renders of the content container when passing state values to useAnimatedStyle,
            // we use SharedValue for managing content and wrapper measurements.
            contentMeasuredWidthAnimated.set(width);
            wrapperMeasuredHeightAnimated.set(height);
            setContentMeasuredWidth(width);
            setWrapperMeasuredHeight(height);
        }}>
                {content}
                <react_native_1.View style={pointerWrapperStyle}>
                    <react_native_1.View style={pointerStyle}/>
                </react_native_1.View>
            </AnimatedWrapper>
        </portal_1.Portal>);
}
BaseGenericTooltip.displayName = 'BaseGenericTooltip';
exports.default = react_1.default.memo(BaseGenericTooltip);
