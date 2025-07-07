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
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
var react_1 = require("react");
// eslint-disable-next-line no-restricted-imports
var react_native_1 = require("react-native");
var FullScreenContext_1 = require("@components/VideoPlayerContexts/FullScreenContext");
var useDebouncedState_1 = require("@hooks/useDebouncedState");
var Browser_1 = require("@libs/Browser");
var variables_1 = require("@styles/variables");
var CONST_1 = require("@src/CONST");
var initialViewportHeight = (_b = (_a = window.visualViewport) === null || _a === void 0 ? void 0 : _a.height) !== null && _b !== void 0 ? _b : window.innerHeight;
var tagNamesOpenKeyboard = [CONST_1.default.ELEMENT_NAME.INPUT, CONST_1.default.ELEMENT_NAME.TEXTAREA];
var isMobile = (0, Browser_1.isMobile)();
/**
 * A wrapper around React Native's useWindowDimensions hook.
 */
function default_1(useCachedViewportHeight) {
    var _a;
    if (useCachedViewportHeight === void 0) { useCachedViewportHeight = false; }
    var _b = (_a = (0, react_1.useContext)(FullScreenContext_1.FullScreenContext)) !== null && _a !== void 0 ? _a : {
        isFullScreenRef: (0, react_1.useRef)(false),
        lockedWindowDimensionsRef: (0, react_1.useRef)(null),
        lockWindowDimensions: function () { },
        unlockWindowDimensions: function () { },
    }, isFullScreenRef = _b.isFullScreenRef, lockedWindowDimensionsRef = _b.lockedWindowDimensionsRef, lockWindowDimensions = _b.lockWindowDimensions, unlockWindowDimensions = _b.unlockWindowDimensions;
    var isCachedViewportHeight = useCachedViewportHeight && (0, Browser_1.isMobileWebKit)();
    var cachedViewportHeightWithKeyboardRef = (0, react_1.useRef)(initialViewportHeight);
    var _c = (0, react_native_1.useWindowDimensions)(), windowWidth = _c.width, windowHeight = _c.height;
    // These are the same as the ones in useResponsiveLayout, but we need to redefine them here to avoid cyclic dependency.
    // When the soft keyboard opens on mWeb, the window height changes. Use static screen height instead to get real screenHeight.
    var screenHeight = react_native_1.Dimensions.get('screen').height;
    var isExtraSmallScreenHeight = screenHeight <= variables_1.default.extraSmallMobileResponsiveHeightBreakpoint;
    var isSmallScreenWidth = windowWidth <= variables_1.default.mobileResponsiveWidthBreakpoint;
    var isMediumScreenWidth = windowWidth > variables_1.default.mobileResponsiveWidthBreakpoint && windowWidth <= variables_1.default.tabletResponsiveWidthBreakpoint;
    var isLargeScreenWidth = windowWidth > variables_1.default.tabletResponsiveWidthBreakpoint;
    var isExtraSmallScreenWidth = windowWidth <= variables_1.default.extraSmallMobileResponsiveWidthBreakpoint;
    var lowerScreenDimension = Math.min(windowWidth, windowHeight);
    var isSmallScreen = lowerScreenDimension <= variables_1.default.mobileResponsiveWidthBreakpoint;
    var responsiveLayoutResults = {
        isSmallScreenWidth: isSmallScreenWidth,
        isExtraSmallScreenHeight: isExtraSmallScreenHeight,
        isExtraSmallScreenWidth: isExtraSmallScreenWidth,
        isMediumScreenWidth: isMediumScreenWidth,
        isLargeScreenWidth: isLargeScreenWidth,
        isSmallScreen: isSmallScreen,
    };
    var _d = (0, useDebouncedState_1.default)(windowHeight, CONST_1.default.TIMING.RESIZE_DEBOUNCE_TIME), cachedViewportHeight = _d[1], setCachedViewportHeight = _d[2];
    var handleFocusIn = (0, react_1.useRef)(function (event) {
        var targetElement = event.target;
        if (tagNamesOpenKeyboard.includes(targetElement.tagName)) {
            setCachedViewportHeight(cachedViewportHeightWithKeyboardRef.current);
        }
    });
    (0, react_1.useEffect)(function () {
        if (!isCachedViewportHeight) {
            return;
        }
        var handleFocusInValue = handleFocusIn.current;
        window.addEventListener('focusin', handleFocusInValue);
        return function () {
            window.removeEventListener('focusin', handleFocusInValue);
        };
    }, [isCachedViewportHeight]);
    var handleFocusOut = (0, react_1.useRef)(function (event) {
        var targetElement = event.target;
        if (tagNamesOpenKeyboard.includes(targetElement.tagName)) {
            setCachedViewportHeight(initialViewportHeight);
        }
    });
    (0, react_1.useEffect)(function () {
        if (!isCachedViewportHeight) {
            return;
        }
        var handleFocusOutValue = handleFocusOut.current;
        window.addEventListener('focusout', handleFocusOutValue);
        return function () {
            window.removeEventListener('focusout', handleFocusOutValue);
        };
    }, [isCachedViewportHeight]);
    (0, react_1.useEffect)(function () {
        if (!isCachedViewportHeight && windowHeight >= cachedViewportHeightWithKeyboardRef.current) {
            return;
        }
        setCachedViewportHeight(windowHeight);
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, [windowHeight, isCachedViewportHeight]);
    (0, react_1.useEffect)(function () {
        if (!isCachedViewportHeight || !window.matchMedia('(orientation: portrait)').matches || windowHeight >= initialViewportHeight) {
            return;
        }
        cachedViewportHeightWithKeyboardRef.current = windowHeight;
    }, [isCachedViewportHeight, windowHeight]);
    var windowDimensions = {
        windowWidth: windowWidth,
        windowHeight: isCachedViewportHeight ? cachedViewportHeight : windowHeight,
        responsiveLayoutResults: responsiveLayoutResults,
    };
    if (!lockedWindowDimensionsRef.current && !isFullScreenRef.current) {
        return windowDimensions;
    }
    var didScreenChangeOrientation = isMobile &&
        lockedWindowDimensionsRef.current &&
        isExtraSmallScreenWidth === lockedWindowDimensionsRef.current.responsiveLayoutResults.isExtraSmallScreenHeight &&
        isSmallScreenWidth === lockedWindowDimensionsRef.current.responsiveLayoutResults.isSmallScreen &&
        isMediumScreenWidth === lockedWindowDimensionsRef.current.responsiveLayoutResults.isMediumScreenWidth &&
        isLargeScreenWidth === lockedWindowDimensionsRef.current.responsiveLayoutResults.isLargeScreenWidth &&
        lockedWindowDimensionsRef.current.windowWidth !== windowWidth &&
        lockedWindowDimensionsRef.current.windowHeight !== windowHeight;
    // if video is in fullscreen mode, lock the window dimensions since they can change and cause whole app to re-render
    if (!lockedWindowDimensionsRef.current || didScreenChangeOrientation) {
        lockWindowDimensions(windowDimensions);
        return windowDimensions;
    }
    // if video exits fullscreen mode, unlock the window dimensions
    if (lockedWindowDimensionsRef.current && !isFullScreenRef.current) {
        var lastLockedWindowDimensions = __assign({}, lockedWindowDimensionsRef.current);
        unlockWindowDimensions();
        return { windowWidth: lastLockedWindowDimensions.windowWidth, windowHeight: lastLockedWindowDimensions.windowHeight };
    }
    return { windowWidth: lockedWindowDimensionsRef.current.windowWidth, windowHeight: lockedWindowDimensionsRef.current.windowHeight };
}
