"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_onyx_1 = require("react-native-onyx");
var FullscreenLoadingIndicator_1 = require("@components/FullscreenLoadingIndicator");
var usePrevious_1 = require("@hooks/usePrevious");
var Navigation_1 = require("@libs/Navigation/Navigation");
var Session = require("@userActions/Session");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
function UnlinkLoginPage(_a) {
    var _b, _c;
    var route = _a.route, account = _a.account;
    var accountID = (_b = route.params.accountID) !== null && _b !== void 0 ? _b : -1;
    var validateCode = (_c = route.params.validateCode) !== null && _c !== void 0 ? _c : '';
    var prevIsLoading = (0, usePrevious_1.default)(!!(account === null || account === void 0 ? void 0 : account.isLoading));
    (0, react_1.useEffect)(function () {
        Session.unlinkLogin(Number(accountID), validateCode);
        // We only want this to run on mount
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, []);
    (0, react_1.useEffect)(function () {
        // Only navigate when the unlink login request is completed
        if (!prevIsLoading || (account === null || account === void 0 ? void 0 : account.isLoading)) {
            return;
        }
        Navigation_1.default.goBack();
    }, [prevIsLoading, account === null || account === void 0 ? void 0 : account.isLoading]);
    return <FullscreenLoadingIndicator_1.default />;
}
UnlinkLoginPage.displayName = 'UnlinkLoginPage';
exports.default = (0, react_native_onyx_1.withOnyx)({
    account: { key: ONYXKEYS_1.default.ACCOUNT },
})(UnlinkLoginPage);
