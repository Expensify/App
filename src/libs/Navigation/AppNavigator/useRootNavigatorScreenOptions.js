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
var presentation_1 = require("@libs/Navigation/PlatformStackNavigation/navigationOptions/presentation");
var variables_1 = require("@styles/variables");
var hideKeyboardOnSwipe_1 = require("./hideKeyboardOnSwipe");
var useModalCardStyleInterpolator_1 = require("./useModalCardStyleInterpolator");
var commonScreenOptions = {
    web: {
        cardOverlayEnabled: true,
    },
};
var useRootNavigatorScreenOptions = function () {
    var StyleUtils = (0, useStyleUtils_1.default)();
    var modalCardStyleInterpolator = (0, useModalCardStyleInterpolator_1.default)();
    var shouldUseNarrowLayout = (0, useResponsiveLayout_1.default)().shouldUseNarrowLayout;
    var themeStyles = (0, useThemeStyles_1.default)();
    return {
        rightModalNavigator: __assign(__assign(__assign({}, commonScreenOptions), hideKeyboardOnSwipe_1.default), { animation: animation_1.default.SLIDE_FROM_RIGHT, 
            // We want pop in RHP since there are some flows that would work weird otherwise
            animationTypeForReplace: 'pop', web: {
                presentation: presentation_1.default.TRANSPARENT_MODAL,
                cardStyleInterpolator: function (props) { return modalCardStyleInterpolator({ props: props, shouldAnimateSidePanel: true }); },
            } }),
        basicModalNavigator: {
            presentation: presentation_1.default.TRANSPARENT_MODAL,
            web: {
                cardOverlayEnabled: false,
                cardStyle: __assign(__assign({}, StyleUtils.getNavigationModalCardStyle()), { backgroundColor: 'transparent', width: '100%', top: 0, left: 0, position: 'fixed' }),
                cardStyleInterpolator: function (props) { return modalCardStyleInterpolator({ props: props, isOnboardingModal: true }); },
            },
        },
        splitNavigator: __assign(__assign({}, commonScreenOptions), { 
            // We need to turn off animation for the full screen to avoid delay when closing screens.
            animation: animation_1.default.NONE, web: {
                cardStyleInterpolator: function (props) { return modalCardStyleInterpolator({ props: props, isFullScreenModal: true }); },
                cardStyle: StyleUtils.getNavigationModalCardStyle(),
            } }),
        fullScreen: __assign(__assign({}, commonScreenOptions), { 
            // We need to turn off animation for the full screen to avoid delay when closing screens.
            animation: animation_1.default.NONE, web: {
                cardStyle: {
                    height: '100%',
                },
                cardStyleInterpolator: function (props) { return modalCardStyleInterpolator({ props: props, isFullScreenModal: true }); },
            } }),
        workspacesListPage: __assign(__assign({}, commonScreenOptions), { 
            // We need to turn off animation for the full screen to avoid delay when closing screens.
            animation: animation_1.default.NONE, web: {
                cardStyleInterpolator: function (props) { return modalCardStyleInterpolator({ props: props, isFullScreenModal: true, shouldAnimateSidePanel: true }); },
                cardStyle: shouldUseNarrowLayout ? __assign(__assign({}, StyleUtils.getNavigationModalCardStyle()), { paddingLeft: 0 }) : __assign(__assign({}, themeStyles.h100), { paddingLeft: variables_1.default.navigationTabBarSize }),
            } }),
    };
};
exports.default = useRootNavigatorScreenOptions;
