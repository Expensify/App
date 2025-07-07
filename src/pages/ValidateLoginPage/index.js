"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var FullscreenLoadingIndicator_1 = require("@components/FullscreenLoadingIndicator");
var useOnyx_1 = require("@hooks/useOnyx");
var Navigation_1 = require("@libs/Navigation/Navigation");
var Session = require("@userActions/Session");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
function ValidateLoginPage(_a) {
    var _b = _a.route.params, accountID = _b.accountID, validateCode = _b.validateCode, exitTo = _b.exitTo;
    var session = (0, useOnyx_1.default)(ONYXKEYS_1.default.SESSION)[0];
    (0, react_1.useEffect)(function () {
        // Wait till navigation becomes available
        Navigation_1.default.isNavigationReady().then(function () {
            if ((session === null || session === void 0 ? void 0 : session.authToken) && (session === null || session === void 0 ? void 0 : session.authTokenType) !== CONST_1.default.AUTH_TOKEN_TYPES.ANONYMOUS) {
                // If already signed in, do not show the validate code if not on web,
                // because we don't want to block the user with the interstitial page.
                if (exitTo) {
                    Session.handleExitToNavigation(exitTo);
                    return;
                }
                Navigation_1.default.goBack();
            }
            else {
                Session.signInWithValidateCodeAndNavigate(Number(accountID), validateCode, '', exitTo);
            }
        });
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, []);
    (0, react_1.useEffect)(function () {
        if ((session === null || session === void 0 ? void 0 : session.autoAuthState) !== CONST_1.default.AUTO_AUTH_STATE.FAILED) {
            return;
        }
        // Go back to initial route if validation fails
        Navigation_1.default.isNavigationReady().then(function () {
            Navigation_1.default.goBack();
        });
    }, [session === null || session === void 0 ? void 0 : session.autoAuthState]);
    return <FullscreenLoadingIndicator_1.default />;
}
ValidateLoginPage.displayName = 'ValidateLoginPage';
exports.default = ValidateLoginPage;
