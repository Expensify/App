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
var react_native_reanimated_1 = require("react-native-reanimated");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var easing = react_native_reanimated_1.Easing.bezier(0.76, 0.0, 0.24, 1.0).factory();
function Container(_a) {
    var style = _a.style, _b = _a.animationInTiming, animationInTiming = _b === void 0 ? 300 : _b, _c = _a.animationOutTiming, animationOutTiming = _c === void 0 ? 300 : _c, onOpenCallBack = _a.onOpenCallBack, onCloseCallBack = _a.onCloseCallBack, props = __rest(_a, ["style", "animationInTiming", "animationOutTiming", "onOpenCallBack", "onCloseCallBack"]);
    var styles = (0, useThemeStyles_1.default)();
    var onCloseCallbackRef = (0, react_1.useRef)(onCloseCallBack);
    var opacity = (0, react_native_reanimated_1.useSharedValue)(0);
    var isInitiated = (0, react_native_reanimated_1.useSharedValue)(false);
    (0, react_1.useEffect)(function () {
        onCloseCallbackRef.current = onCloseCallBack;
    }, [onCloseCallBack]);
    (0, react_1.useEffect)(function () {
        if (isInitiated.get()) {
            return;
        }
        isInitiated.set(true);
        opacity.set((0, react_native_reanimated_1.withTiming)(1, { duration: animationInTiming, easing: easing }, onOpenCallBack));
    }, [animationInTiming, onOpenCallBack, opacity, isInitiated]);
    var animatedStyles = (0, react_native_reanimated_1.useAnimatedStyle)(function () { return ({ opacity: opacity.get() }); }, [opacity]);
    var Exiting = (0, react_1.useMemo)(function () {
        var FadeOut = new react_native_reanimated_1.Keyframe({
            from: { opacity: 1 },
            to: {
                opacity: 0,
                easing: easing,
            },
        });
        // eslint-disable-next-line react-compiler/react-compiler
        return FadeOut.duration(animationOutTiming).withCallback(function () { return onCloseCallbackRef.current(); });
    }, [animationOutTiming]);
    return (<react_native_reanimated_1.default.View style={[style, styles.modalContainer, styles.modalAnimatedContainer, animatedStyles]} exiting={Exiting} 
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...props}>
            {props.children}
        </react_native_reanimated_1.default.View>);
}
Container.displayName = 'ModalContainer';
exports.default = Container;
