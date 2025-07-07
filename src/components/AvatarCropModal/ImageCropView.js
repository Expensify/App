"use strict";
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
var react_1 = require("react");
var react_native_1 = require("react-native");
var react_native_gesture_handler_1 = require("react-native-gesture-handler");
var react_native_reanimated_1 = require("react-native-reanimated");
var Icon_1 = require("@components/Icon");
var Expensicons = require("@components/Icon/Expensicons");
var useStyleUtils_1 = require("@hooks/useStyleUtils");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var ControlSelection_1 = require("@libs/ControlSelection");
function ImageCropView(_a) {
    var _b = _a.imageUri, imageUri = _b === void 0 ? '' : _b, _c = _a.containerSize, containerSize = _c === void 0 ? 0 : _c, _d = _a.panGesture, panGesture = _d === void 0 ? react_native_gesture_handler_1.Gesture.Pan() : _d, _e = _a.maskImage, maskImage = _e === void 0 ? Expensicons.ImageCropCircleMask : _e, props = __rest(_a, ["imageUri", "containerSize", "panGesture", "maskImage"]);
    var styles = (0, useThemeStyles_1.default)();
    var StyleUtils = (0, useStyleUtils_1.default)();
    var containerStyle = StyleUtils.getWidthAndHeightStyle(containerSize, containerSize);
    var originalImageHeight = props.originalImageHeight;
    var originalImageWidth = props.originalImageWidth;
    var rotation = props.rotation;
    var translateX = props.translateX;
    var translateY = props.translateY;
    var scale = props.scale;
    // A reanimated memoized style, which updates when the image's size or scale changes.
    var imageStyle = (0, react_native_reanimated_1.useAnimatedStyle)(function () {
        'worklet';
        var height = originalImageHeight.get();
        var width = originalImageWidth.get();
        var aspectRatio = height > width ? height / width : width / height;
        var rotate = (0, react_native_reanimated_1.interpolate)(rotation.get(), [0, 360], [0, 360]);
        return {
            transform: [{ translateX: translateX.get() }, { translateY: translateY.get() }, { scale: scale.get() * aspectRatio }, { rotate: "".concat(rotate, "deg") }],
        };
    }, [originalImageHeight, originalImageWidth, rotation, translateX, translateY, scale]);
    // We're preventing text selection with ControlSelection.blockElement to prevent safari
    // default behaviour of cursor - I-beam cursor on drag. See https://github.com/Expensify/App/issues/13688
    return (<react_native_gesture_handler_1.GestureDetector gesture={panGesture}>
            <react_native_reanimated_1.default.View ref={function (el) { return ControlSelection_1.default.blockElement(el); }} style={[containerStyle, styles.imageCropContainer]}>
                <react_native_reanimated_1.default.Image style={[imageStyle, styles.h100, styles.w100]} source={{ uri: imageUri }} resizeMode="contain"/>
                <react_native_1.View style={[containerStyle, styles.l0, styles.b0, styles.pAbsolute]}>
                    <Icon_1.default src={maskImage} 
    // TODO uncomment the line once the tint color issue for android(https://github.com/expo/expo/issues/21530#issuecomment-1836283564) is fixed
    // fill={theme.iconReversed}
    width={containerSize} height={containerSize} key={containerSize}/>
                </react_native_1.View>
            </react_native_reanimated_1.default.View>
        </react_native_gesture_handler_1.GestureDetector>);
}
ImageCropView.displayName = 'ImageCropView';
// React.memo is needed here to prevent styles recompilation
// which sometimes may cause glitches during rerender of the modal
exports.default = react_1.default.memo(ImageCropView);
