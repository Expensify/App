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
var react_1 = require("react");
var useStyleUtils_1 = require("@hooks/useStyleUtils");
var useTheme_1 = require("@hooks/useTheme");
var createPlatformStackNavigator_1 = require("@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator");
var animation_1 = require("@libs/Navigation/PlatformStackNavigation/navigationOptions/animation");
var ConnectionCompletePage_1 = require("@pages/ConnectionCompletePage");
var SessionExpiredPage_1 = require("@pages/ErrorPage/SessionExpiredPage");
var LogInWithShortLivedAuthTokenPage_1 = require("@pages/LogInWithShortLivedAuthTokenPage");
var AppleSignInDesktopPage_1 = require("@pages/signin/AppleSignInDesktopPage");
var GoogleSignInDesktopPage_1 = require("@pages/signin/GoogleSignInDesktopPage");
var SAMLSignInPage_1 = require("@pages/signin/SAMLSignInPage");
var SignInPage_1 = require("@pages/signin/SignInPage");
var UnlinkLoginPage_1 = require("@pages/UnlinkLoginPage");
var ValidateLoginPage_1 = require("@pages/ValidateLoginPage");
var CONFIG_1 = require("@src/CONFIG");
var NAVIGATORS_1 = require("@src/NAVIGATORS");
var SCREENS_1 = require("@src/SCREENS");
var defaultScreenOptions_1 = require("./defaultScreenOptions");
var PublicRightModalNavigator_1 = require("./Navigators/PublicRightModalNavigator");
var TestToolsModalNavigator_1 = require("./Navigators/TestToolsModalNavigator");
var useRootNavigatorScreenOptions_1 = require("./useRootNavigatorScreenOptions");
var RootStack = (0, createPlatformStackNavigator_1.default)();
function PublicScreens() {
    var rootNavigatorScreenOptions = (0, useRootNavigatorScreenOptions_1.default)();
    var theme = (0, useTheme_1.default)();
    var StyleUtils = (0, useStyleUtils_1.default)();
    return (<RootStack.Navigator screenOptions={defaultScreenOptions_1.default}>
            {/* The structure for the HOME route has to be the same in public and auth screens. That's why the name for SignInPage is REPORTS_SPLIT_NAVIGATOR. */}
            <RootStack.Screen name={NAVIGATORS_1.default.REPORTS_SPLIT_NAVIGATOR} options={defaultScreenOptions_1.default} component={CONFIG_1.default.IS_HYBRID_APP ? SessionExpiredPage_1.default : SignInPage_1.default}/>
            <RootStack.Screen name={SCREENS_1.default.TRANSITION_BETWEEN_APPS} component={LogInWithShortLivedAuthTokenPage_1.default}/>
            <RootStack.Screen name={SCREENS_1.default.VALIDATE_LOGIN} options={defaultScreenOptions_1.default} component={ValidateLoginPage_1.default}/>
            <RootStack.Screen name={SCREENS_1.default.CONNECTION_COMPLETE} component={ConnectionCompletePage_1.default}/>
            <RootStack.Screen name={SCREENS_1.default.BANK_CONNECTION_COMPLETE} component={ConnectionCompletePage_1.default}/>
            <RootStack.Screen name={SCREENS_1.default.UNLINK_LOGIN} component={UnlinkLoginPage_1.default}/>
            <RootStack.Screen name={SCREENS_1.default.SIGN_IN_WITH_APPLE_DESKTOP} component={AppleSignInDesktopPage_1.default}/>
            <RootStack.Screen name={SCREENS_1.default.SIGN_IN_WITH_GOOGLE_DESKTOP} component={GoogleSignInDesktopPage_1.default}/>
            <RootStack.Screen name={SCREENS_1.default.SAML_SIGN_IN} component={SAMLSignInPage_1.default}/>
            <RootStack.Screen name={NAVIGATORS_1.default.PUBLIC_RIGHT_MODAL_NAVIGATOR} component={PublicRightModalNavigator_1.default} options={rootNavigatorScreenOptions.rightModalNavigator}/>
            <RootStack.Screen name={NAVIGATORS_1.default.TEST_TOOLS_MODAL_NAVIGATOR} options={__assign(__assign({}, rootNavigatorScreenOptions.basicModalNavigator), { native: {
                contentStyle: __assign({}, StyleUtils.getBackgroundColorWithOpacityStyle(theme.overlay, 0.72)),
                animation: animation_1.InternalPlatformAnimations.FADE,
            }, web: {
                cardStyle: __assign({}, StyleUtils.getBackgroundColorWithOpacityStyle(theme.overlay, 0.72)),
            } })} component={TestToolsModalNavigator_1.default}/>
        </RootStack.Navigator>);
}
PublicScreens.displayName = 'PublicScreens';
exports.default = PublicScreens;
