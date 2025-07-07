"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable react-compiler/react-compiler */
var react_1 = require("react");
var react_dom_1 = require("react-dom");
var react_native_1 = require("react-native");
var react_native_reanimated_1 = require("react-native-reanimated");
var AnimatedPressableWithoutFeedback_1 = require("@components/AnimatedPressableWithoutFeedback");
var TransparentOverlay_1 = require("@components/AutoCompleteSuggestions/AutoCompleteSuggestionsPortal/TransparentOverlay/TransparentOverlay");
var PopoverProvider_1 = require("@components/PopoverProvider");
var Text_1 = require("@components/Text");
var useStyleUtils_1 = require("@hooks/useStyleUtils");
var Fullstory_1 = require("@libs/Fullstory");
var CONST_1 = require("@src/CONST");
var textRef_1 = require("@src/types/utils/textRef");
var viewRef_1 = require("@src/types/utils/viewRef");
// Props will change frequently.
// On every tooltip hover, we update the position in state which will result in re-rendering.
// We also update the state on layout changes which will be triggered often.
// There will be n number of tooltip components in the page.
// It's good to memoize this one.
function BaseGenericTooltip(_a) {
    var animation = _a.animation, windowWidth = _a.windowWidth, xOffset = _a.xOffset, yOffset = _a.yOffset, targetWidth = _a.targetWidth, targetHeight = _a.targetHeight, _b = _a.shiftHorizontal, shiftHorizontal = _b === void 0 ? 0 : _b, _c = _a.shiftVertical, shiftVertical = _c === void 0 ? 0 : _c, text = _a.text, numberOfLines = _a.numberOfLines, _d = _a.maxWidth, maxWidth = _d === void 0 ? 0 : _d, renderTooltipContent = _a.renderTooltipContent, _e = _a.shouldForceRenderingBelow, shouldForceRenderingBelow = _e === void 0 ? false : _e, _f = _a.wrapperStyle, wrapperStyle = _f === void 0 ? {} : _f, _g = _a.anchorAlignment, anchorAlignment = _g === void 0 ? {
        horizontal: CONST_1.default.MODAL.ANCHOR_ORIGIN_HORIZONTAL.CENTER,
        vertical: CONST_1.default.MODAL.ANCHOR_ORIGIN_VERTICAL.BOTTOM,
    } : _g, _h = _a.shouldUseOverlay, shouldUseOverlay = _h === void 0 ? false : _h, _j = _a.onHideTooltip, onHideTooltip = _j === void 0 ? function () { } : _j, _k = _a.isEducationTooltip, isEducationTooltip = _k === void 0 ? false : _k, onTooltipPress = _a.onTooltipPress;
    // The width of tooltip's inner content. Has to be undefined in the beginning
    // as a width of 0 will cause the content to be rendered of a width of 0,
    // which prevents us from measuring it correctly.
    var _l = (0, react_1.useState)(), contentMeasuredWidth = _l[0], setContentMeasuredWidth = _l[1];
    // The height of tooltip's wrapper.
    var _m = (0, react_1.useState)(), wrapperMeasuredHeight = _m[0], setWrapperMeasuredHeight = _m[1];
    var contentRef = (0, react_1.useRef)(null);
    var rootWrapper = (0, react_1.useRef)(null);
    var StyleUtils = (0, useStyleUtils_1.default)();
    var setActivePopoverExtraAnchorRef = (0, react_1.useContext)(PopoverProvider_1.PopoverContext).setActivePopoverExtraAnchorRef;
    (0, react_1.useEffect)(function () {
        if (!isEducationTooltip) {
            return;
        }
        setActivePopoverExtraAnchorRef(rootWrapper);
    }, [isEducationTooltip, setActivePopoverExtraAnchorRef]);
    (0, react_1.useLayoutEffect)(function () {
        var _a, _b, _c;
        // Calculate the tooltip width and height before the browser repaints the screen to prevent flicker
        // because of the late update of the width and the height from onLayout.
        var rootWrapperStyle = (_a = rootWrapper === null || rootWrapper === void 0 ? void 0 : rootWrapper.current) === null || _a === void 0 ? void 0 : _a.style;
        var isScaled = (rootWrapperStyle === null || rootWrapperStyle === void 0 ? void 0 : rootWrapperStyle.transform) === 'scale(0)';
        if (isScaled) {
            // Temporarily reset the scale caused by animation to get the untransformed size.
            rootWrapperStyle.transform = 'scale(1)';
        }
        setContentMeasuredWidth((_b = contentRef.current) === null || _b === void 0 ? void 0 : _b.getBoundingClientRect().width);
        setWrapperMeasuredHeight((_c = rootWrapper.current) === null || _c === void 0 ? void 0 : _c.getBoundingClientRect().height);
        if (isScaled) {
            rootWrapperStyle.transform = 'scale(0)';
        }
    }, []);
    var _o = (0, react_1.useMemo)(function () {
        return StyleUtils.getTooltipStyles({
            tooltip: rootWrapper.current,
            windowWidth: windowWidth,
            xOffset: xOffset,
            yOffset: yOffset,
            tooltipTargetWidth: targetWidth,
            tooltipTargetHeight: targetHeight,
            maxWidth: maxWidth,
            tooltipContentWidth: contentMeasuredWidth,
            tooltipWrapperHeight: wrapperMeasuredHeight,
            manualShiftHorizontal: shiftHorizontal,
            manualShiftVertical: shiftVertical,
            shouldForceRenderingBelow: shouldForceRenderingBelow,
            anchorAlignment: anchorAlignment,
            wrapperStyle: wrapperStyle,
            isEducationTooltip: isEducationTooltip,
        });
    }, [
        StyleUtils,
        windowWidth,
        xOffset,
        yOffset,
        targetWidth,
        targetHeight,
        maxWidth,
        contentMeasuredWidth,
        wrapperMeasuredHeight,
        shiftHorizontal,
        shiftVertical,
        shouldForceRenderingBelow,
        anchorAlignment,
        wrapperStyle,
        isEducationTooltip,
    ]), rootWrapperStyle = _o.rootWrapperStyle, textStyle = _o.textStyle, pointerWrapperStyle = _o.pointerWrapperStyle, pointerStyle = _o.pointerStyle;
    var animationStyle = (0, react_native_reanimated_1.useAnimatedStyle)(function () {
        return StyleUtils.getTooltipAnimatedStyles({ tooltipContentWidth: contentMeasuredWidth, tooltipWrapperHeight: wrapperMeasuredHeight, currentSize: animation });
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
        content = (<react_native_1.View ref={(0, viewRef_1.default)(contentRef)} fsClass={CONST_1.default.FULL_STORY.UNMASK} testID={CONST_1.default.FULL_STORY.UNMASK}>
                {renderTooltipContent()}
            </react_native_1.View>);
    }
    else {
        content = (<Text_1.default numberOfLines={numberOfLines} style={textStyle} fsClass={CONST_1.default.FULL_STORY.UNMASK} testID={CONST_1.default.FULL_STORY.UNMASK}>
                <Text_1.default style={textStyle} ref={(0, textRef_1.default)(contentRef)}>
                    {text}
                </Text_1.default>
            </Text_1.default>);
    }
    var AnimatedWrapper = isEducationTooltip ? AnimatedPressableWithoutFeedback_1.default : react_native_reanimated_1.default.View;
    var body = document.querySelector('body');
    if (!body) {
        return null;
    }
    return react_dom_1.default.createPortal(<>
            {shouldUseOverlay && <TransparentOverlay_1.default onPress={onHideTooltip}/>}
            <AnimatedWrapper ref={(0, viewRef_1.default)(rootWrapper)} style={[rootWrapperStyle, animationStyle]} onPress={isEducationTooltip ? onTooltipPress : undefined} role={isEducationTooltip ? CONST_1.default.ROLE.TOOLTIP : undefined} accessibilityLabel={isEducationTooltip ? CONST_1.default.ROLE.TOOLTIP : undefined} interactive={isEducationTooltip ? !!onTooltipPress : undefined}>
                {content}
                <react_native_1.View style={pointerWrapperStyle}>
                    <react_native_1.View style={pointerStyle}/>
                </react_native_1.View>
            </AnimatedWrapper>
        </>, body);
}
BaseGenericTooltip.displayName = 'BaseGenericTooltip';
exports.default = react_1.default.memo(BaseGenericTooltip);
