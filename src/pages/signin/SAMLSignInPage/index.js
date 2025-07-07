"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var SAMLLoadingIndicator_1 = require("@components/SAMLLoadingIndicator");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var LoginUtils_1 = require("@libs/LoginUtils");
var CONFIG_1 = require("@src/CONFIG");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
function SAMLSignInPage() {
    var translate = (0, useLocalize_1.default)().translate;
    var credentials = (0, useOnyx_1.default)(ONYXKEYS_1.default.CREDENTIALS)[0];
    (0, react_1.useEffect)(function () {
        // If we don't have a valid login to pass here, direct the user back to a clean sign in state to try again
        if (!(credentials === null || credentials === void 0 ? void 0 : credentials.login)) {
            (0, LoginUtils_1.handleSAMLLoginError)(translate('common.error.email'), true);
            return;
        }
        var body = new FormData();
        body.append('email', credentials.login);
        body.append('referer', CONFIG_1.default.EXPENSIFY.EXPENSIFY_CASH_REFERER);
        (0, LoginUtils_1.postSAMLLogin)(body)
            .then(function (response) {
            if (!response || !response.url) {
                (0, LoginUtils_1.handleSAMLLoginError)(translate('common.error.login'), false);
                return;
            }
            window.location.replace(response.url);
        })
            .catch(function (error) {
            var _a;
            (0, LoginUtils_1.handleSAMLLoginError)((_a = error.message) !== null && _a !== void 0 ? _a : translate('common.error.login'), false);
        });
    }, [credentials === null || credentials === void 0 ? void 0 : credentials.login, translate]);
    return <SAMLLoadingIndicator_1.default />;
}
SAMLSignInPage.displayName = 'SAMLSignInPage';
exports.default = SAMLSignInPage;
