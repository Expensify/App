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
var connections_1 = require("@libs/actions/connections");
var QuickbooksOnline_1 = require("@libs/actions/connections/QuickbooksOnline");
var PaymentMethods_1 = require("@libs/actions/PaymentMethods");
var CardUtils_1 = require("@libs/CardUtils");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var SubscriptionUtils_1 = require("@libs/SubscriptionUtils");
var UserUtils_1 = require("@libs/UserUtils");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var useOnyx_1 = require("./useOnyx");
var useTheme_1 = require("./useTheme");
function useIndicatorStatus() {
    var _a, _b, _c, _d;
    var _e, _f, _g, _h, _j, _k, _l, _m;
    var theme = (0, useTheme_1.default)();
    var allConnectionSyncProgresses = (0, useOnyx_1.default)(ONYXKEYS_1.default.COLLECTION.POLICY_CONNECTION_SYNC_PROGRESS)[0];
    var policies = (0, useOnyx_1.default)(ONYXKEYS_1.default.COLLECTION.POLICY)[0];
    var bankAccountList = (0, useOnyx_1.default)(ONYXKEYS_1.default.BANK_ACCOUNT_LIST)[0];
    var reimbursementAccount = (0, useOnyx_1.default)(ONYXKEYS_1.default.REIMBURSEMENT_ACCOUNT)[0];
    var fundList = (0, useOnyx_1.default)(ONYXKEYS_1.default.FUND_LIST)[0];
    var userWallet = (0, useOnyx_1.default)(ONYXKEYS_1.default.USER_WALLET)[0];
    var walletTerms = (0, useOnyx_1.default)(ONYXKEYS_1.default.WALLET_TERMS)[0];
    var loginList = (0, useOnyx_1.default)(ONYXKEYS_1.default.LOGIN_LIST)[0];
    var privatePersonalDetails = (0, useOnyx_1.default)(ONYXKEYS_1.default.PRIVATE_PERSONAL_DETAILS)[0];
    var allCards = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.CARD_LIST))[0];
    var hasBrokenFeedConnection = (0, CardUtils_1.checkIfFeedConnectionIsBroken)(allCards, CONST_1.default.EXPENSIFY_CARD.BANK);
    // If a policy was just deleted from Onyx, then Onyx will pass a null value to the props, and
    // those should be cleaned out before doing any error checking
    var cleanPolicies = (0, react_1.useMemo)(function () { return Object.fromEntries(Object.entries(policies !== null && policies !== void 0 ? policies : {}).filter(function (_a) {
        var policy = _a[1];
        return policy === null || policy === void 0 ? void 0 : policy.id;
    })); }, [policies]);
    var policyErrors = (_a = {},
        _a[CONST_1.default.INDICATOR_STATUS.HAS_POLICY_ERRORS] = Object.values(cleanPolicies).find(PolicyUtils_1.shouldShowPolicyError),
        _a[CONST_1.default.INDICATOR_STATUS.HAS_CUSTOM_UNITS_ERROR] = Object.values(cleanPolicies).find(PolicyUtils_1.shouldShowCustomUnitsError),
        _a[CONST_1.default.INDICATOR_STATUS.HAS_EMPLOYEE_LIST_ERROR] = Object.values(cleanPolicies).find(PolicyUtils_1.shouldShowEmployeeListError),
        _a[CONST_1.default.INDICATOR_STATUS.HAS_SYNC_ERRORS] = Object.values(cleanPolicies).find(function (cleanPolicy) {
            return (0, PolicyUtils_1.shouldShowSyncError)(cleanPolicy, (0, connections_1.isConnectionInProgress)(allConnectionSyncProgresses === null || allConnectionSyncProgresses === void 0 ? void 0 : allConnectionSyncProgresses["".concat(ONYXKEYS_1.default.COLLECTION.POLICY_CONNECTION_SYNC_PROGRESS).concat(cleanPolicy === null || cleanPolicy === void 0 ? void 0 : cleanPolicy.id)], cleanPolicy));
        }),
        _a[CONST_1.default.INDICATOR_STATUS.HAS_QBO_EXPORT_ERROR] = Object.values(cleanPolicies).find(QuickbooksOnline_1.shouldShowQBOReimbursableExportDestinationAccountError),
        _a);
    // All of the error & info-checking methods are put into an array. This is so that using _.some() will return
    // early as soon as the first error / info condition is returned. This makes the checks very efficient since
    // we only care if a single error / info condition exists anywhere.
    var errorChecking = __assign(__assign((_b = {}, _b[CONST_1.default.INDICATOR_STATUS.HAS_USER_WALLET_ERRORS] = Object.keys((_e = userWallet === null || userWallet === void 0 ? void 0 : userWallet.errors) !== null && _e !== void 0 ? _e : {}).length > 0, _b[CONST_1.default.INDICATOR_STATUS.HAS_PAYMENT_METHOD_ERROR] = (0, PaymentMethods_1.hasPaymentMethodError)(bankAccountList, fundList), _b), Object.fromEntries(Object.entries(policyErrors).map(function (_a) {
        var error = _a[0], policy = _a[1];
        return [error, !!policy];
    }))), (_c = {}, _c[CONST_1.default.INDICATOR_STATUS.HAS_SUBSCRIPTION_ERRORS] = (0, SubscriptionUtils_1.hasSubscriptionRedDotError)(), _c[CONST_1.default.INDICATOR_STATUS.HAS_REIMBURSEMENT_ACCOUNT_ERRORS] = Object.keys((_f = reimbursementAccount === null || reimbursementAccount === void 0 ? void 0 : reimbursementAccount.errors) !== null && _f !== void 0 ? _f : {}).length > 0, _c[CONST_1.default.INDICATOR_STATUS.HAS_LOGIN_LIST_ERROR] = !!loginList && (0, UserUtils_1.hasLoginListError)(loginList), _c[CONST_1.default.INDICATOR_STATUS.HAS_WALLET_TERMS_ERRORS] = Object.keys((_g = walletTerms === null || walletTerms === void 0 ? void 0 : walletTerms.errors) !== null && _g !== void 0 ? _g : {}).length > 0 && !(walletTerms === null || walletTerms === void 0 ? void 0 : walletTerms.chatReportID), _c[CONST_1.default.INDICATOR_STATUS.HAS_CARD_CONNECTION_ERROR] = hasBrokenFeedConnection, _c[CONST_1.default.INDICATOR_STATUS.HAS_PHONE_NUMBER_ERROR] = (_j = !!((_h = privatePersonalDetails === null || privatePersonalDetails === void 0 ? void 0 : privatePersonalDetails.errorFields) === null || _h === void 0 ? void 0 : _h.phoneNumber)) !== null && _j !== void 0 ? _j : undefined, _c));
    var infoChecking = (_d = {},
        _d[CONST_1.default.INDICATOR_STATUS.HAS_LOGIN_LIST_INFO] = !!loginList && (0, UserUtils_1.hasLoginListInfo)(loginList),
        _d[CONST_1.default.INDICATOR_STATUS.HAS_SUBSCRIPTION_INFO] = (0, SubscriptionUtils_1.hasSubscriptionGreenDotInfo)(),
        _d);
    var error = ((_k = Object.entries(errorChecking).find(function (_a) {
        var value = _a[1];
        return value;
    })) !== null && _k !== void 0 ? _k : [])[0];
    var info = ((_l = Object.entries(infoChecking).find(function (_a) {
        var value = _a[1];
        return value;
    })) !== null && _l !== void 0 ? _l : [])[0];
    var status = (error !== null && error !== void 0 ? error : info);
    var policyIDWithErrors = (_m = Object.values(policyErrors).find(Boolean)) === null || _m === void 0 ? void 0 : _m.id;
    var indicatorColor = error ? theme.danger : theme.success;
    return { indicatorColor: indicatorColor, status: status, policyIDWithErrors: policyIDWithErrors };
}
exports.default = useIndicatorStatus;
