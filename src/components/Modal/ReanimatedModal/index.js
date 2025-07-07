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
var noop_1 = require("lodash/noop");
var react_1 = require("react");
var react_native_1 = require("react-native");
var react_native_reanimated_1 = require("react-native-reanimated");
var KeyboardAvoidingView_1 = require("@components/KeyboardAvoidingView");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var getPlatform_1 = require("@libs/getPlatform");
var CONST_1 = require("@src/CONST");
var Backdrop_1 = require("./Backdrop");
var Container_1 = require("./Container");
function ReanimatedModal(_a) {
    var testID = _a.testID, animationInDelay = _a.animationInDelay, _b = _a.animationInTiming, animationInTiming = _b === void 0 ? 300 : _b, _c = _a.animationOutTiming, animationOutTiming = _c === void 0 ? 300 : _c, _d = _a.animationIn, animationIn = _d === void 0 ? 'fadeIn' : _d, _e = _a.animationOut, animationOut = _e === void 0 ? 'fadeOut' : _e, _f = _a.avoidKeyboard, avoidKeyboard = _f === void 0 ? false : _f, _g = _a.coverScreen, coverScreen = _g === void 0 ? true : _g, children = _a.children, _h = _a.hasBackdrop, hasBackdrop = _h === void 0 ? true : _h, _j = _a.backdropColor, backdropColor = _j === void 0 ? 'black' : _j, _k = _a.backdropOpacity, backdropOpacity = _k === void 0 ? 0.72 : _k, _l = _a.customBackdrop, customBackdrop = _l === void 0 ? null : _l, _m = _a.isVisible, isVisible = _m === void 0 ? false : _m, _o = _a.onModalWillShow, onModalWillShow = _o === void 0 ? noop_1.default : _o, _p = _a.onModalShow, onModalShow = _p === void 0 ? noop_1.default : _p, _q = _a.onModalWillHide, onModalWillHide = _q === void 0 ? noop_1.default : _q, _r = _a.onModalHide, onModalHide = _r === void 0 ? noop_1.default : _r, onDismiss = _a.onDismiss, _s = _a.onBackdropPress, onBackdropPress = _s === void 0 ? noop_1.default : _s, _t = _a.onBackButtonPress, onBackButtonPress = _t === void 0 ? noop_1.default : _t, style = _a.style, type = _a.type, _u = _a.statusBarTranslucent, statusBarTranslucent = _u === void 0 ? false : _u, props = __rest(_a, ["testID", "animationInDelay", "animationInTiming", "animationOutTiming", "animationIn", "animationOut", "avoidKeyboard", "coverScreen", "children", "hasBackdrop", "backdropColor", "backdropOpacity", "customBackdrop", "isVisible", "onModalWillShow", "onModalShow", "onModalWillHide", "onModalHide", "onDismiss", "onBackdropPress", "onBackButtonPress", "style", "type", "statusBarTranslucent"]);
    var _v = (0, react_1.useState)(isVisible), isVisibleState = _v[0], setIsVisibleState = _v[1];
    var _w = (0, react_1.useState)(false), isContainerOpen = _w[0], setIsContainerOpen = _w[1];
    var _x = (0, react_1.useState)(false), isTransitioning = _x[0], setIsTransitioning = _x[1];
    var backHandlerListener = (0, react_1.useRef)(null);
    var handleRef = (0, react_1.useRef)(undefined);
    var styles = (0, useThemeStyles_1.default)();
    var onBackButtonPressHandler = (0, react_1.useCallback)(function () {
        if (isVisibleState) {
            onBackButtonPress();
            return true;
        }
        return false;
    }, [isVisibleState, onBackButtonPress]);
    var handleEscape = (0, react_1.useCallback)(function (e) {
        if (e.key !== 'Escape' || onBackButtonPressHandler() !== true) {
            return;
        }
        e.stopImmediatePropagation();
    }, [onBackButtonPressHandler]);
    (0, react_1.useEffect)(function () {
        if ((0, getPlatform_1.default)() === CONST_1.default.PLATFORM.WEB || (0, getPlatform_1.default)() === CONST_1.default.PLATFORM.DESKTOP) {
            document.body.addEventListener('keyup', handleEscape, { capture: true });
        }
        else {
            backHandlerListener.current = react_native_1.BackHandler.addEventListener('hardwareBackPress', onBackButtonPressHandler);
        }
        return function () {
            var _a;
            if ((0, getPlatform_1.default)() === CONST_1.default.PLATFORM.WEB || (0, getPlatform_1.default)() === CONST_1.default.PLATFORM.DESKTOP) {
                document.body.removeEventListener('keyup', handleEscape, { capture: true });
            }
            else {
                (_a = backHandlerListener.current) === null || _a === void 0 ? void 0 : _a.remove();
            }
        };
    }, [handleEscape, onBackButtonPressHandler]);
    (0, react_1.useEffect)(function () { return function () {
        if (handleRef.current) {
            react_native_1.InteractionManager.clearInteractionHandle(handleRef.current);
        }
        setIsVisibleState(false);
        setIsContainerOpen(false);
    }; }, 
    // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    []);
    (0, react_1.useEffect)(function () {
        if (isVisible && !isContainerOpen && !isTransitioning) {
            handleRef.current = react_native_1.InteractionManager.createInteractionHandle();
            onModalWillShow();
            setIsVisibleState(true);
            setIsTransitioning(true);
        }
        else if (!isVisible && isContainerOpen && !isTransitioning) {
            handleRef.current = react_native_1.InteractionManager.createInteractionHandle();
            onModalWillHide();
            setIsVisibleState(false);
            setIsTransitioning(true);
        }
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, [isVisible, isContainerOpen, isTransitioning]);
    var backdropStyle = (0, react_1.useMemo)(function () {
        var _a = react_native_1.Dimensions.get('screen'), width = _a.width, height = _a.height;
        return { width: width, height: height, backgroundColor: backdropColor };
    }, [backdropColor]);
    var onOpenCallBack = (0, react_1.useCallback)(function () {
        setIsTransitioning(false);
        setIsContainerOpen(true);
        if (handleRef.current) {
            react_native_1.InteractionManager.clearInteractionHandle(handleRef.current);
        }
        onModalShow();
    }, [onModalShow]);
    var onCloseCallBack = (0, react_1.useCallback)(function () {
        setIsTransitioning(false);
        setIsContainerOpen(false);
        if (handleRef.current) {
            react_native_1.InteractionManager.clearInteractionHandle(handleRef.current);
        }
        if ((0, getPlatform_1.default)() !== CONST_1.default.PLATFORM.IOS) {
            onModalHide();
        }
    }, [onModalHide]);
    var containerView = (<Container_1.default pointerEvents="box-none" animationInTiming={animationInTiming} animationOutTiming={animationOutTiming} animationInDelay={animationInDelay} onOpenCallBack={onOpenCallBack} onCloseCallBack={onCloseCallBack} animationIn={animationIn} animationOut={animationOut} style={style} type={type}>
            {children}
        </Container_1.default>);
    var backdropView = (<Backdrop_1.default isBackdropVisible={isVisible} style={backdropStyle} customBackdrop={customBackdrop} onBackdropPress={onBackdropPress} animationInTiming={animationInTiming} animationOutTiming={animationOutTiming} animationInDelay={animationInDelay} backdropOpacity={backdropOpacity}/>);
    if (!coverScreen && isVisibleState) {
        return (<react_native_1.View pointerEvents="box-none" style={[styles.modalBackdrop, styles.modalContainerBox]}>
                {hasBackdrop && backdropView}
                {containerView}
            </react_native_1.View>);
    }
    var isBackdropMounted = isVisibleState || ((isTransitioning || isContainerOpen !== isVisibleState) && (0, getPlatform_1.default)() === CONST_1.default.PLATFORM.WEB);
    return (<react_native_reanimated_1.LayoutAnimationConfig skipExiting={(0, getPlatform_1.default)() !== CONST_1.default.PLATFORM.WEB}>
            <react_native_1.Modal transparent animationType="none" 
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    visible={isVisibleState || isTransitioning || isContainerOpen !== isVisibleState} onRequestClose={onBackButtonPress} statusBarTranslucent={statusBarTranslucent} testID={testID} onDismiss={function () {
            onDismiss === null || onDismiss === void 0 ? void 0 : onDismiss();
            if ((0, getPlatform_1.default)() === CONST_1.default.PLATFORM.IOS) {
                onModalHide();
            }
        }} 
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...props}>
                {isBackdropMounted && hasBackdrop && backdropView}
                {avoidKeyboard ? (<KeyboardAvoidingView_1.default behavior="padding" pointerEvents="box-none" style={[style, { margin: 0 }]}>
                        {isVisibleState && containerView}
                    </KeyboardAvoidingView_1.default>) : (isVisibleState && containerView)}
            </react_native_1.Modal>
        </react_native_reanimated_1.LayoutAnimationConfig>);
}
ReanimatedModal.displayName = 'ReanimatedModal';
exports.default = ReanimatedModal;
