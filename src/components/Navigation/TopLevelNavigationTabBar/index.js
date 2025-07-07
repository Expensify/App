"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var FullScreenBlockingViewContextProvider_1 = require("@components/FullScreenBlockingViewContextProvider");
var NavigationTabBar_1 = require("@components/Navigation/NavigationTabBar");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var useSafeAreaPaddings_1 = require("@hooks/useSafeAreaPaddings");
var useStyleUtils_1 = require("@hooks/useStyleUtils");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var getIsNavigationTabBarVisibleDirectly_1 = require("./getIsNavigationTabBarVisibleDirectly");
var getIsScreenWithNavigationTabBarFocused_1 = require("./getIsScreenWithNavigationTabBarFocused");
var getSelectedTab_1 = require("./getSelectedTab");
/**
 * TopLevelNavigationTabBar is displayed when the user can interact with the bottom tab bar.
 * We hide it when:
 * 1. The bottom tab bar is not visible.
 * 2. There is transition between screens with and without the bottom tab bar.
 * 3. The bottom tab bar is under the overlay.
 * For cases 2 and 3, local bottom tab bar mounted on the screen will be displayed.
 */
function TopLevelNavigationTabBar(_a) {
    var state = _a.state;
    var styles = (0, useThemeStyles_1.default)();
    var shouldUseNarrowLayout = (0, useResponsiveLayout_1.default)().shouldUseNarrowLayout;
    var paddingBottom = (0, useSafeAreaPaddings_1.default)().paddingBottom;
    var _b = (0, react_1.useState)(false), isAfterClosingTransition = _b[0], setIsAfterClosingTransition = _b[1];
    var cancelAfterInteractions = (0, react_1.useRef)(undefined);
    var isBlockingViewVisible = (0, react_1.useContext)(FullScreenBlockingViewContextProvider_1.FullScreenBlockingViewContext).isBlockingViewVisible;
    var StyleUtils = (0, useStyleUtils_1.default)();
    // That means it's visible and it's not covered by the overlay.
    var isNavigationTabVisibleDirectly = (0, getIsNavigationTabBarVisibleDirectly_1.default)(state);
    var isScreenWithNavigationTabFocused = (0, getIsScreenWithNavigationTabBarFocused_1.default)(state);
    var selectedTab = (0, getSelectedTab_1.default)(state);
    var shouldDisplayBottomBar = shouldUseNarrowLayout ? isScreenWithNavigationTabFocused : isNavigationTabVisibleDirectly;
    var isReadyToDisplayBottomBar = isAfterClosingTransition && shouldDisplayBottomBar && !isBlockingViewVisible;
    var shouldDisplayLHB = !shouldUseNarrowLayout;
    (0, react_1.useEffect)(function () {
        if (!shouldDisplayBottomBar) {
            // If the bottom tab is not visible, that means there is a screen covering it.
            // In that case we need to set the flag to true because there will be a transition for which we need to wait.
            setIsAfterClosingTransition(false);
        }
        else {
            // If the bottom tab should be visible, we want to wait for transition to finish.
            cancelAfterInteractions.current = react_native_1.InteractionManager.runAfterInteractions(function () {
                setIsAfterClosingTransition(true);
            });
            return function () { var _a; return (_a = cancelAfterInteractions.current) === null || _a === void 0 ? void 0 : _a.cancel(); };
        }
    }, [shouldDisplayBottomBar]);
    return (<react_native_1.View style={[
            styles.topLevelNavigationTabBar(isReadyToDisplayBottomBar, shouldUseNarrowLayout, paddingBottom),
            shouldDisplayLHB ? StyleUtils.positioning.l0 : StyleUtils.positioning.b0,
        ]}>
            {/* We are not rendering NavigationTabBar conditionally for two reasons
            1. It's faster to hide/show it than mount a new when needed.
            2. We need to hide tooltips as well if they were displayed. */}
            <NavigationTabBar_1.default selectedTab={selectedTab} isTooltipAllowed={isReadyToDisplayBottomBar} isTopLevelBar/>
        </react_native_1.View>);
}
TopLevelNavigationTabBar.displayName = 'TopLevelNavigationTabBar';
exports.default = TopLevelNavigationTabBar;
