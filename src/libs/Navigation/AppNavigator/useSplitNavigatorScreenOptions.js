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
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var useStyleUtils_1 = require("@hooks/useStyleUtils");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var animation_1 = require("@libs/Navigation/PlatformStackNavigation/navigationOptions/animation");
var variables_1 = require("@styles/variables");
var CONFIG_1 = require("@src/CONFIG");
var hideKeyboardOnSwipe_1 = require("./hideKeyboardOnSwipe");
var useModalCardStyleInterpolator_1 = require("./useModalCardStyleInterpolator");
var commonScreenOptions = {
    web: {
        cardOverlayEnabled: true,
    },
};
var useSplitNavigatorScreenOptions = function () {
    var themeStyles = (0, useThemeStyles_1.default)();
    var StyleUtils = (0, useStyleUtils_1.default)();
    var shouldUseNarrowLayout = (0, useResponsiveLayout_1.default)().shouldUseNarrowLayout;
    var modalCardStyleInterpolator = (0, useModalCardStyleInterpolator_1.default)();
    return {
        sidebarScreen: __assign(__assign({}, commonScreenOptions), { title: CONFIG_1.default.SITE_TITLE, headerShown: false, web: {
                // Note: The card* properties won't be applied on mobile platforms, as they use the native defaults.
                cardStyleInterpolator: function (props) { return modalCardStyleInterpolator({ props: props }); },
                cardStyle: __assign(__assign(__assign({}, StyleUtils.getNavigationModalCardStyle()), { width: shouldUseNarrowLayout ? '100%' : variables_1.default.sideBarWithLHBWidth + variables_1.default.navigationTabBarSize, 
                    // We need to shift the sidebar to not be covered by the StackNavigator so it can be clickable.
                    marginLeft: shouldUseNarrowLayout ? 0 : -(variables_1.default.sideBarWithLHBWidth + variables_1.default.navigationTabBarSize), paddingLeft: shouldUseNarrowLayout ? 0 : variables_1.default.navigationTabBarSize }), (shouldUseNarrowLayout ? {} : themeStyles.borderRight)),
            } }),
        centralScreen: __assign(__assign(__assign({}, commonScreenOptions), hideKeyboardOnSwipe_1.default), { headerShown: false, title: CONFIG_1.default.SITE_TITLE, animation: shouldUseNarrowLayout ? animation_1.default.SLIDE_FROM_RIGHT : animation_1.default.NONE, animationTypeForReplace: 'pop', web: {
                cardStyleInterpolator: function (props) { return modalCardStyleInterpolator({ props: props, isFullScreenModal: true, shouldAnimateSidePanel: true }); },
                cardStyle: shouldUseNarrowLayout ? StyleUtils.getNavigationModalCardStyle() : themeStyles.h100,
            } }),
    };
};
exports.default = useSplitNavigatorScreenOptions;
