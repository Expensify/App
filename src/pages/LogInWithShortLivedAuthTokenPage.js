"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var FullscreenLoadingIndicator_1 = require("@components/FullscreenLoadingIndicator");
var useOnyx_1 = require("@hooks/useOnyx");
var Log_1 = require("@libs/Log");
var Navigation_1 = require("@libs/Navigation/Navigation");
var Session_1 = require("@userActions/Session");
var CONFIG_1 = require("@src/CONFIG");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var SessionExpiredPage_1 = require("./ErrorPage/SessionExpiredPage");
function LogInWithShortLivedAuthTokenPage(_a) {
    var _b;
    var route = _a.route;
    var _c = (_b = route === null || route === void 0 ? void 0 : route.params) !== null && _b !== void 0 ? _b : {}, _d = _c.shortLivedAuthToken, shortLivedAuthToken = _d === void 0 ? '' : _d, _e = _c.shortLivedToken, shortLivedToken = _e === void 0 ? '' : _e, authTokenType = _c.authTokenType, exitTo = _c.exitTo, error = _c.error;
    var account = (0, useOnyx_1.default)(ONYXKEYS_1.default.ACCOUNT)[0];
    (0, react_1.useEffect)(function () {
        // We have to check for both shortLivedAuthToken and shortLivedToken, as the old mobile app uses shortLivedToken, and is not being actively updated.
        var token = shortLivedAuthToken || shortLivedToken;
        if (!(account === null || account === void 0 ? void 0 : account.isLoading) && authTokenType === CONST_1.default.AUTH_TOKEN_TYPES.SUPPORT) {
            (0, Session_1.signInWithSupportAuthToken)(shortLivedAuthToken);
            Navigation_1.default.isNavigationReady().then(function () {
                // We must call goBack() to remove the /transition route from history
                Navigation_1.default.goBack();
                Navigation_1.default.navigate(ROUTES_1.default.HOME);
            });
            return;
        }
        // Try to authenticate using the shortLivedToken if we're not already trying to load the accounts
        if (token && !(account === null || account === void 0 ? void 0 : account.isLoading)) {
            Log_1.default.info('LogInWithShortLivedAuthTokenPage - Successfully received shortLivedAuthToken. Signing in...');
            (0, Session_1.signInWithShortLivedAuthToken)(token);
            return;
        }
        // If an error is returned as part of the route, ensure we set it in the onyxData for the account
        if (error) {
            (0, Session_1.setAccountError)(error);
        }
        // For HybridApp we have separate logic to handle transitions.
        if (!CONFIG_1.default.IS_HYBRID_APP && exitTo) {
            Navigation_1.default.isNavigationReady().then(function () {
                // We must call goBack() to remove the /transition route from history
                Navigation_1.default.goBack();
                Navigation_1.default.navigate(exitTo);
            });
        }
        // The only dependencies of the effect are based on props.route
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, [route]);
    if (account === null || account === void 0 ? void 0 : account.isLoading) {
        return <FullscreenLoadingIndicator_1.default />;
    }
    return <SessionExpiredPage_1.default />;
}
LogInWithShortLivedAuthTokenPage.displayName = 'LogInWithShortLivedAuthTokenPage';
exports.default = LogInWithShortLivedAuthTokenPage;
