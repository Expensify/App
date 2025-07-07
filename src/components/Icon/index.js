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
var react_1 = require("react");
var react_native_1 = require("react-native");
var react_native_reanimated_1 = require("react-native-reanimated");
var AttachmentCarouselPagerContext_1 = require("@components/Attachments/AttachmentCarousel/Pager/AttachmentCarouselPagerContext");
var ImageSVG_1 = require("@components/ImageSVG");
var MultiGestureCanvas_1 = require("@components/MultiGestureCanvas");
var useStyleUtils_1 = require("@hooks/useStyleUtils");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var DeviceCapabilities_1 = require("@libs/DeviceCapabilities");
var variables_1 = require("@styles/variables");
var IconWrapperStyles_1 = require("./IconWrapperStyles");
function Icon(_a) {
    var src = _a.src, _b = _a.width, width = _b === void 0 ? variables_1.default.iconSizeNormal : _b, _c = _a.height, height = _c === void 0 ? variables_1.default.iconSizeNormal : _c, _d = _a.fill, fill = _d === void 0 ? undefined : _d, _e = _a.small, small = _e === void 0 ? false : _e, _f = _a.large, large = _f === void 0 ? false : _f, _g = _a.medium, medium = _g === void 0 ? false : _g, _h = _a.inline, inline = _h === void 0 ? false : _h, _j = _a.additionalStyles, additionalStyles = _j === void 0 ? [] : _j, _k = _a.hovered, hovered = _k === void 0 ? false : _k, _l = _a.pressed, pressed = _l === void 0 ? false : _l, _m = _a.testID, testID = _m === void 0 ? '' : _m, _o = _a.contentFit, contentFit = _o === void 0 ? 'cover' : _o, _p = _a.isButtonIcon, isButtonIcon = _p === void 0 ? false : _p, _q = _a.enableMultiGestureCanvas, enableMultiGestureCanvas = _q === void 0 ? false : _q;
    var StyleUtils = (0, useStyleUtils_1.default)();
    var styles = (0, useThemeStyles_1.default)();
    var _r = StyleUtils.getIconWidthAndHeightStyle(small, medium, large, width, height, isButtonIcon), iconWidth = _r.width, iconHeight = _r.height;
    var iconStyles = [StyleUtils.getWidthAndHeightStyle(width !== null && width !== void 0 ? width : 0, height), IconWrapperStyles_1.default, styles.pAbsolute, additionalStyles];
    var contentSize = { width: iconWidth, height: iconHeight };
    var _s = (0, react_1.useState)(), canvasSize = _s[0], setCanvasSize = _s[1];
    var isCanvasLoading = canvasSize === undefined;
    var updateCanvasSize = (0, react_1.useCallback)(function (_a) {
        var _b = _a.nativeEvent.layout, layoutWidth = _b.width, layoutHeight = _b.height;
        return setCanvasSize({ width: react_native_1.PixelRatio.roundToNearestPixel(layoutWidth), height: react_native_1.PixelRatio.roundToNearestPixel(layoutHeight) });
    }, []);
    var isScrollingEnabledFallback = (0, react_native_reanimated_1.useSharedValue)(false);
    var attachmentCarouselPagerContext = (0, react_1.useContext)(AttachmentCarouselPagerContext_1.default);
    var _t = (0, react_1.useMemo)(function () {
        if (attachmentCarouselPagerContext === null) {
            return { pagerRef: undefined, isScrollEnabled: isScrollingEnabledFallback, onTap: function () { }, onSwipeDown: function () { } };
        }
        return __assign({}, attachmentCarouselPagerContext);
    }, [attachmentCarouselPagerContext, isScrollingEnabledFallback]), onTap = _t.onTap, onSwipeDown = _t.onSwipeDown, pagerRef = _t.pagerRef, isScrollEnabled = _t.isScrollEnabled;
    if (inline) {
        return (<react_native_1.View testID={testID} style={[StyleUtils.getWidthAndHeightStyle(width !== null && width !== void 0 ? width : 0, height), styles.bgTransparent, styles.overflowVisible]}>
                <react_native_1.View style={iconStyles}>
                    <ImageSVG_1.default src={src} width={iconWidth} height={iconHeight} fill={fill} hovered={hovered} pressed={pressed} contentFit={contentFit}/>
                </react_native_1.View>
            </react_native_1.View>);
    }
    if ((0, DeviceCapabilities_1.canUseTouchScreen)() && enableMultiGestureCanvas) {
        return (<react_native_1.View style={react_native_1.StyleSheet.absoluteFill} onLayout={updateCanvasSize}>
                {!isCanvasLoading && (<MultiGestureCanvas_1.default isActive canvasSize={canvasSize} contentSize={contentSize} zoomRange={MultiGestureCanvas_1.DEFAULT_ZOOM_RANGE} pagerRef={pagerRef} isUsedInCarousel={false} isPagerScrollEnabled={isScrollEnabled} onTap={onTap} onSwipeDown={onSwipeDown}>
                        <react_native_1.View testID={testID} style={[additionalStyles]}>
                            <ImageSVG_1.default src={src} width={iconWidth} height={iconHeight} fill={fill} hovered={hovered} pressed={pressed} contentFit={contentFit}/>
                        </react_native_1.View>
                    </MultiGestureCanvas_1.default>)}
            </react_native_1.View>);
    }
    return (<react_native_1.View testID={testID} style={additionalStyles}>
            <ImageSVG_1.default src={src} width={iconWidth} height={iconHeight} fill={fill} hovered={hovered} pressed={pressed} contentFit={contentFit}/>
        </react_native_1.View>);
}
Icon.displayName = 'Icon';
exports.default = Icon;
