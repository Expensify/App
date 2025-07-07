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
var react_native_reanimated_1 = require("react-native-reanimated");
var utils_1 = require("@components/Modal/ReanimatedModal/utils");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var CONST_1 = require("@src/CONST");
function Container(_a) {
    var style = _a.style, _b = _a.animationInTiming, animationInTiming = _b === void 0 ? 300 : _b, _c = _a.animationOutTiming, animationOutTiming = _c === void 0 ? 300 : _c, onCloseCallBack = _a.onCloseCallBack, onOpenCallBack = _a.onOpenCallBack, animationIn = _a.animationIn, animationOut = _a.animationOut, type = _a.type, props = __rest(_a, ["style", "animationInTiming", "animationOutTiming", "onCloseCallBack", "onOpenCallBack", "animationIn", "animationOut", "type"]);
    var styles = (0, useThemeStyles_1.default)();
    var Entering = (0, react_1.useMemo)(function () {
        var AnimationIn = new react_native_reanimated_1.Keyframe((0, utils_1.getModalInAnimation)(animationIn));
        return AnimationIn.duration(animationInTiming).withCallback(function () {
            'worklet';
            (0, react_native_reanimated_1.runOnJS)(onOpenCallBack)();
        });
    }, [animationIn, animationInTiming, onOpenCallBack]);
    var Exiting = (0, react_1.useMemo)(function () {
        var AnimationOut = new react_native_reanimated_1.Keyframe((0, utils_1.getModalOutAnimation)(animationOut));
        return AnimationOut.duration(animationOutTiming).withCallback(function () {
            'worklet';
            (0, react_native_reanimated_1.runOnJS)(onCloseCallBack)();
        });
    }, [animationOutTiming, onCloseCallBack, animationOut]);
    return (<react_native_1.View style={[style, styles.modalContainer]} 
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...props}>
            <react_native_reanimated_1.default.View style={[styles.modalAnimatedContainer, type !== CONST_1.default.MODAL.MODAL_TYPE.BOTTOM_DOCKED && styles.flex1]} entering={Entering} exiting={Exiting}>
                {props.children}
            </react_native_reanimated_1.default.View>
        </react_native_1.View>);
}
Container.displayName = 'ModalContainer';
exports.default = Container;
