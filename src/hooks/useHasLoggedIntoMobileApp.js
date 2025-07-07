"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var useOnyx_1 = require("./useOnyx");
/**
 * Returns whether the user has ever logged into one of the Expensify mobile apps (iOS or Android),
 * along with a flag indicating if the login data has finished loading.
 */
var useHasLoggedIntoMobileApp = function () {
    var _a = (0, useOnyx_1.default)(ONYXKEYS_1.default.NVP_LAST_ECASH_IOS_LOGIN, { canBeMissing: true }), lastECashIOSLogin = _a[0], lastECashIOSLoginResult = _a[1];
    var _b = (0, useOnyx_1.default)(ONYXKEYS_1.default.NVP_LAST_ECASH_ANDROID_LOGIN, { canBeMissing: true }), lastECashAndroidLogin = _b[0], lastECashAndroidLoginResult = _b[1];
    var _c = (0, useOnyx_1.default)(ONYXKEYS_1.default.NVP_LAST_IPHONE_LOGIN, { canBeMissing: true }), lastiPhoneLogin = _c[0], lastiPhoneLoginResult = _c[1];
    var _d = (0, useOnyx_1.default)(ONYXKEYS_1.default.NVP_LAST_ANDROID_LOGIN, { canBeMissing: true }), lastAndroidLogin = _d[0], lastAndroidLoginResult = _d[1];
    var hasLoggedIntoMobileApp = !!lastECashIOSLogin || !!lastECashAndroidLogin || !!lastiPhoneLogin || !!lastAndroidLogin;
    var isLastMobileAppLoginLoaded = lastECashIOSLoginResult.status !== 'loading' &&
        lastECashAndroidLoginResult.status !== 'loading' &&
        lastiPhoneLoginResult.status !== 'loading' &&
        lastAndroidLoginResult.status !== 'loading';
    return { hasLoggedIntoMobileApp: hasLoggedIntoMobileApp, isLastMobileAppLoginLoaded: isLastMobileAppLoginLoaded };
};
exports.default = useHasLoggedIntoMobileApp;
