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
var native_1 = require("@react-navigation/native");
var lottie_react_native_1 = require("lottie-react-native");
var react_1 = require("react");
var react_native_1 = require("react-native");
var useAppState_1 = require("@hooks/useAppState");
var useNetwork_1 = require("@hooks/useNetwork");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Browser_1 = require("@libs/Browser");
var isSideModalNavigator_1 = require("@libs/Navigation/helpers/isSideModalNavigator");
var CONST_1 = require("@src/CONST");
var SplashScreenStateContext_1 = require("@src/SplashScreenStateContext");
function Lottie(_a, forwardedRef) {
    var source = _a.source, webStyle = _a.webStyle, shouldLoadAfterInteractions = _a.shouldLoadAfterInteractions, props = __rest(_a, ["source", "webStyle", "shouldLoadAfterInteractions"]);
    var animationRef = (0, react_1.useRef)(null);
    var appState = (0, useAppState_1.default)();
    var splashScreenState = (0, SplashScreenStateContext_1.useSplashScreenStateContext)().splashScreenState;
    var styles = (0, useThemeStyles_1.default)();
    var _b = react_1.default.useState(false), isError = _b[0], setIsError = _b[1];
    (0, useNetwork_1.default)({ onReconnect: function () { return setIsError(false); } });
    var _c = (0, react_1.useState)(), animationFile = _c[0], setAnimationFile = _c[1];
    var _d = (0, react_1.useState)(false), isInteractionComplete = _d[0], setIsInteractionComplete = _d[1];
    (0, react_1.useEffect)(function () {
        setAnimationFile(source.file);
    }, [setAnimationFile, source.file]);
    (0, react_1.useEffect)(function () {
        if (!shouldLoadAfterInteractions) {
            return;
        }
        var interactionTask = react_native_1.InteractionManager.runAfterInteractions(function () {
            setIsInteractionComplete(true);
        });
        return function () {
            interactionTask.cancel();
        };
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, []);
    var aspectRatioStyle = styles.aspectRatioLottie(source);
    var browser = (0, Browser_1.getBrowser)();
    var _e = react_1.default.useState(false), hasNavigatedAway = _e[0], setHasNavigatedAway = _e[1];
    var navigationContainerRef = (0, react_1.useContext)(native_1.NavigationContainerRefContext);
    var navigator = (0, react_1.useContext)(native_1.NavigationContext);
    (0, react_1.useEffect)(function () {
        if (!browser || !navigationContainerRef || !navigator) {
            return;
        }
        var unsubscribeNavigationFocus = navigator.addListener('focus', function () {
            var _a;
            setHasNavigatedAway(false);
            (_a = animationRef.current) === null || _a === void 0 ? void 0 : _a.play();
        });
        return unsubscribeNavigationFocus;
    }, [browser, navigationContainerRef, navigator]);
    (0, react_1.useEffect)(function () {
        if (!browser || !navigationContainerRef || !navigator) {
            return;
        }
        var unsubscribeNavigationBlur = navigator.addListener('blur', function () {
            var _a, _b, _c;
            var state = navigationContainerRef.getRootState();
            var targetRouteName = (_c = (_a = state === null || state === void 0 ? void 0 : state.routes) === null || _a === void 0 ? void 0 : _a[(_b = state === null || state === void 0 ? void 0 : state.index) !== null && _b !== void 0 ? _b : 0]) === null || _c === void 0 ? void 0 : _c.name;
            if (!(0, isSideModalNavigator_1.default)(targetRouteName) || (0, Browser_1.isMobile)()) {
                setHasNavigatedAway(true);
            }
        });
        return unsubscribeNavigationBlur;
    }, [browser, navigationContainerRef, navigator]);
    // If user is being navigated away, let pause the animation to prevent memory leak.
    // see issue: https://github.com/Expensify/App/issues/36645
    (0, react_1.useEffect)(function () {
        var _a;
        if (!animationRef.current || !hasNavigatedAway) {
            return;
        }
        (_a = animationRef === null || animationRef === void 0 ? void 0 : animationRef.current) === null || _a === void 0 ? void 0 : _a.pause();
    }, [hasNavigatedAway]);
    // If the page navigates to another screen, the image fails to load, app is in background state, animation file isn't ready, or the splash screen isn't hidden yet,
    // we'll just render an empty view as the fallback to prevent
    // 1. heavy rendering, see issues: https://github.com/Expensify/App/issues/34696 and https://github.com/Expensify/App/issues/47273
    // 2. lag on react navigation transitions, see issue: https://github.com/Expensify/App/issues/44812
    if (isError ||
        appState.isBackground ||
        !animationFile ||
        splashScreenState !== CONST_1.default.BOOT_SPLASH_STATE.HIDDEN ||
        ((!isInteractionComplete || hasNavigatedAway) && shouldLoadAfterInteractions)) {
        return (<react_native_1.View style={[aspectRatioStyle, props.style]} testID={CONST_1.default.LOTTIE_VIEW_TEST_ID}/>);
    }
    return (<lottie_react_native_1.default 
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...props} source={animationFile} key={"".concat(hasNavigatedAway)} ref={function (ref) {
            if (typeof forwardedRef === 'function') {
                forwardedRef(ref);
            }
            else if (forwardedRef && 'current' in forwardedRef) {
                // eslint-disable-next-line no-param-reassign
                forwardedRef.current = ref;
            }
            animationRef.current = ref;
        }} style={[aspectRatioStyle, props.style]} webStyle={__assign(__assign({}, aspectRatioStyle), webStyle)} onAnimationFailure={function () { return setIsError(true); }} testID={CONST_1.default.LOTTIE_VIEW_TEST_ID}/>);
}
Lottie.displayName = 'Lottie';
exports.default = (0, react_1.forwardRef)(Lottie);
