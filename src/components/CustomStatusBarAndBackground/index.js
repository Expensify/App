"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_reanimated_1 = require("react-native-reanimated");
var usePrevious_1 = require("@hooks/usePrevious");
var useTheme_1 = require("@hooks/useTheme");
var Navigation_1 = require("@libs/Navigation/Navigation");
var StatusBar_1 = require("@libs/StatusBar");
var CustomStatusBarAndBackgroundContext_1 = require("./CustomStatusBarAndBackgroundContext");
var updateGlobalBackgroundColor_1 = require("./updateGlobalBackgroundColor");
var updateStatusBarAppearance_1 = require("./updateStatusBarAppearance");
function CustomStatusBarAndBackground(_a) {
    var _b = _a.isNested, isNested = _b === void 0 ? false : _b;
    var _c = (0, react_1.useContext)(CustomStatusBarAndBackgroundContext_1.default), isRootStatusBarEnabled = _c.isRootStatusBarEnabled, setRootStatusBarEnabled = _c.setRootStatusBarEnabled;
    var theme = (0, useTheme_1.default)();
    var _d = (0, react_1.useState)(), statusBarStyle = _d[0], setStatusBarStyle = _d[1];
    var isDisabled = !isNested && !isRootStatusBarEnabled;
    // Disable the root status bar when a nested status bar is rendered
    (0, react_1.useEffect)(function () {
        if (isNested) {
            setRootStatusBarEnabled(false);
        }
        return function () {
            if (!isNested) {
                return;
            }
            setRootStatusBarEnabled(true);
        };
    }, [isNested, setRootStatusBarEnabled]);
    var didForceUpdateStatusBarRef = (0, react_1.useRef)(false);
    var prevIsRootStatusBarEnabled = (0, usePrevious_1.default)(isRootStatusBarEnabled);
    // The prev and current status bar background color refs are initialized with the splash screen background color so the status bar color is changed from the splash screen color to the expected color at least once on first render - https://github.com/Expensify/App/issues/34154
    var prevStatusBarBackgroundColor = (0, react_native_reanimated_1.useSharedValue)(theme.splashBG);
    var statusBarBackgroundColor = (0, react_native_reanimated_1.useSharedValue)(theme.splashBG);
    var statusBarAnimation = (0, react_native_reanimated_1.useSharedValue)(0);
    (0, react_native_reanimated_1.useAnimatedReaction)(function () { return statusBarAnimation.get(); }, function (current, previous) {
        // Do not run if either of the animated value is null
        // or previous animated value is greater than or equal to the current one
        if (previous === null || current === null || current <= previous) {
            return;
        }
        var backgroundColor = (0, react_native_reanimated_1.interpolateColor)(statusBarAnimation.get(), [0, 1], [prevStatusBarBackgroundColor.get(), statusBarBackgroundColor.get()]);
        (0, react_native_reanimated_1.runOnJS)(updateStatusBarAppearance_1.default)({ backgroundColor: backgroundColor });
    });
    var listenerCount = (0, react_1.useRef)(0);
    // Updates the status bar style and background color depending on the current route and theme
    // This callback is triggered every time the route changes or the theme changes
    var updateStatusBarStyle = (0, react_1.useCallback)(function (listenerID) {
        // Check if this function is either called through the current navigation listener
        // react-navigation library has a bug internally, where it can't keep track of the listeners, therefore, sometimes when the useEffect would re-render and we run navigationRef.removeListener the listener isn't removed and we end up with two or more listeners.
        // https://github.com/Expensify/App/issues/34154#issuecomment-1898519399
        if (listenerID !== undefined && listenerID !== listenerCount.current) {
            return;
        }
        // Set the status bar color depending on the current route.
        // If we don't have any color defined for a route, fall back to
        // appBG color.
        var currentRoute;
        if (Navigation_1.navigationRef.isReady()) {
            currentRoute = Navigation_1.navigationRef.getCurrentRoute();
        }
        var newStatusBarStyle = theme.statusBarStyle;
        var currentScreenBackgroundColor = theme.appBG;
        if (currentRoute && 'name' in currentRoute && currentRoute.name in theme.PAGE_THEMES) {
            var pageTheme = theme.PAGE_THEMES[currentRoute.name];
            newStatusBarStyle = pageTheme.statusBarStyle;
            var backgroundColorFromRoute = (currentRoute === null || currentRoute === void 0 ? void 0 : currentRoute.params) &&
                typeof (currentRoute === null || currentRoute === void 0 ? void 0 : currentRoute.params) === 'object' &&
                'backgroundColor' in currentRoute.params &&
                typeof currentRoute.params.backgroundColor === 'string' &&
                currentRoute.params.backgroundColor;
            // It's possible for backgroundColorFromRoute to be empty string, so we must use "||" to fallback to backgroundColorFallback.
            // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
            currentScreenBackgroundColor = backgroundColorFromRoute || pageTheme.backgroundColor;
        }
        prevStatusBarBackgroundColor.set(statusBarBackgroundColor.get());
        statusBarBackgroundColor.set(currentScreenBackgroundColor);
        var callUpdateStatusBarAppearance = function () {
            (0, updateStatusBarAppearance_1.default)({ statusBarStyle: newStatusBarStyle });
            setStatusBarStyle(newStatusBarStyle);
        };
        var callUpdateStatusBarBackgroundColor = function () {
            statusBarAnimation.set(0);
            statusBarAnimation.set((0, react_native_reanimated_1.withDelay)(300, (0, react_native_reanimated_1.withTiming)(1)));
        };
        // Don't update the status bar style if it's the same as the current one, to prevent flashing.
        // Force update if the root status bar is back on active or it won't overwrite the nested status bar style
        if (!didForceUpdateStatusBarRef.current && !prevIsRootStatusBarEnabled && isRootStatusBarEnabled) {
            callUpdateStatusBarAppearance();
            callUpdateStatusBarBackgroundColor();
            if (!prevIsRootStatusBarEnabled && isRootStatusBarEnabled) {
                didForceUpdateStatusBarRef.current = true;
            }
            return;
        }
        if (newStatusBarStyle !== statusBarStyle) {
            callUpdateStatusBarAppearance();
        }
        if (currentScreenBackgroundColor !== theme.appBG || prevStatusBarBackgroundColor.get() !== theme.appBG) {
            callUpdateStatusBarBackgroundColor();
        }
    }, [
        theme.statusBarStyle,
        theme.appBG,
        theme.PAGE_THEMES,
        prevStatusBarBackgroundColor,
        statusBarBackgroundColor,
        prevIsRootStatusBarEnabled,
        isRootStatusBarEnabled,
        statusBarStyle,
        statusBarAnimation,
    ]);
    (0, react_1.useEffect)(function () {
        didForceUpdateStatusBarRef.current = false;
    }, [isRootStatusBarEnabled]);
    (0, react_1.useEffect)(function () {
        if (isDisabled) {
            return;
        }
        // Update status bar when theme changes
        updateStatusBarStyle();
        // Add navigation state listeners to update the status bar every time the route changes
        // We have to pass a count as the listener id, because "react-navigation" somehow doesn't remove listeners properly
        var listenerID = ++listenerCount.current;
        var listener = function () { return updateStatusBarStyle(listenerID); };
        Navigation_1.navigationRef.addListener('state', listener);
        return function () { return Navigation_1.navigationRef.removeListener('state', listener); };
    }, [isDisabled, updateStatusBarStyle]);
    // Update the global background and status bar style (on web) every time the theme changes.
    // The background of the html element needs to be updated, otherwise you will see a big contrast when resizing the window or when the keyboard is open on iOS web.
    // The status bar style needs to be updated when the user changes the theme, otherwise, the status bar will not change its color (mWeb iOS).
    (0, react_1.useEffect)(function () {
        if (isDisabled) {
            return;
        }
        (0, updateGlobalBackgroundColor_1.default)(theme);
        updateStatusBarStyle();
    }, [isDisabled, theme, updateStatusBarStyle]);
    if (isDisabled) {
        return null;
    }
    return <StatusBar_1.default />;
}
CustomStatusBarAndBackground.displayName = 'CustomStatusBarAndBackground';
exports.default = CustomStatusBarAndBackground;
