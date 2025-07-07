"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var FullscreenLoadingIndicator_1 = require("@components/FullscreenLoadingIndicator");
var InitialURLContextProvider_1 = require("@components/InitialURLContextProvider");
var useOnyx_1 = require("@hooks/useOnyx");
var SessionUtils_1 = require("@libs/SessionUtils");
var Navigation_1 = require("@navigation/Navigation");
var Session_1 = require("@userActions/Session");
var CONFIG_1 = require("@src/CONFIG");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
// This page is responsible for handling transitions from OldDot. Specifically, it logs the current user
// out if the transition is for another user.
//
// This component should not do any other navigation as that handled in App.setUpPoliciesAndNavigate
function LogOutPreviousUserPage(_a) {
    var _b;
    var route = _a.route;
    var initialURL = (0, react_1.useContext)(InitialURLContextProvider_1.InitialURLContext).initialURL;
    var session = (0, useOnyx_1.default)(ONYXKEYS_1.default.SESSION, { canBeMissing: false })[0];
    var account = (0, useOnyx_1.default)(ONYXKEYS_1.default.ACCOUNT, { canBeMissing: true })[0];
    var isAccountLoading = account === null || account === void 0 ? void 0 : account.isLoading;
    var _c = (_b = route === null || route === void 0 ? void 0 : route.params) !== null && _b !== void 0 ? _b : {}, authTokenType = _c.authTokenType, _d = _c.shortLivedAuthToken, shortLivedAuthToken = _d === void 0 ? '' : _d, exitTo = _c.exitTo;
    (0, react_1.useEffect)(function () {
        var sessionEmail = session === null || session === void 0 ? void 0 : session.email;
        var transitionURL = CONFIG_1.default.IS_HYBRID_APP ? "".concat(CONST_1.default.DEEPLINK_BASE_URL).concat(initialURL !== null && initialURL !== void 0 ? initialURL : '') : initialURL;
        var isLoggingInAsNewUser = (0, SessionUtils_1.isLoggingInAsNewUser)(transitionURL !== null && transitionURL !== void 0 ? transitionURL : undefined, sessionEmail);
        var isSupportalLogin = authTokenType === CONST_1.default.AUTH_TOKEN_TYPES.SUPPORT;
        if (isLoggingInAsNewUser) {
            // We don't want to close react-native app in this particular case.
            (0, Session_1.signOutAndRedirectToSignIn)(false, isSupportalLogin, false);
            return;
        }
        if (isSupportalLogin) {
            (0, Session_1.signInWithSupportAuthToken)(shortLivedAuthToken);
            Navigation_1.default.isNavigationReady().then(function () {
                // We must call goBack() to remove the /transition route from history
                Navigation_1.default.goBack();
                Navigation_1.default.navigate(ROUTES_1.default.HOME);
            });
            return;
        }
        // Even if the user was already authenticated in NewDot, we need to reauthenticate them with shortLivedAuthToken,
        // because the old authToken stored in Onyx may be invalid.
        (0, Session_1.signInWithShortLivedAuthToken)(shortLivedAuthToken);
        // We only want to run this effect once on mount (when the page first loads after transitioning from OldDot)
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, [initialURL]);
    (0, react_1.useEffect)(function () {
        var sessionEmail = session === null || session === void 0 ? void 0 : session.email;
        var transitionURL = CONFIG_1.default.IS_HYBRID_APP ? "".concat(CONST_1.default.DEEPLINK_BASE_URL).concat(initialURL !== null && initialURL !== void 0 ? initialURL : '') : initialURL;
        var isLoggingInAsNewUser = (0, SessionUtils_1.isLoggingInAsNewUser)(transitionURL !== null && transitionURL !== void 0 ? transitionURL : undefined, sessionEmail);
        // We don't want to navigate to the exitTo route when creating a new workspace from a deep link,
        // because we already handle creating the optimistic policy and navigating to it in App.setUpPoliciesAndNavigate,
        // which is already called when AuthScreens mounts.
        // For HybridApp we have separate logic to handle transitions.
        if (!CONFIG_1.default.IS_HYBRID_APP && exitTo !== ROUTES_1.default.WORKSPACE_NEW && !isAccountLoading && !isLoggingInAsNewUser) {
            Navigation_1.default.isNavigationReady().then(function () {
                // remove this screen and navigate to exit route
                Navigation_1.default.goBack();
                if (exitTo) {
                    Navigation_1.default.navigate(exitTo);
                }
            });
        }
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, [initialURL, isAccountLoading]);
    return <FullscreenLoadingIndicator_1.default />;
}
LogOutPreviousUserPage.displayName = 'LogOutPreviousUserPage';
exports.default = LogOutPreviousUserPage;
