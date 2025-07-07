"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var PaymentMethods_1 = require("@libs/actions/PaymentMethods");
var CardUtils_1 = require("@libs/CardUtils");
var UserUtils_1 = require("@libs/UserUtils");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var useOnyx_1 = require("./useOnyx");
var useTheme_1 = require("./useTheme");
function useAccountTabIndicatorStatus() {
    var _a, _b;
    var _c, _d, _e, _f, _g, _h, _j;
    var theme = (0, useTheme_1.default)();
    var bankAccountList = (0, useOnyx_1.default)(ONYXKEYS_1.default.BANK_ACCOUNT_LIST, { canBeMissing: true })[0];
    var reimbursementAccount = (0, useOnyx_1.default)(ONYXKEYS_1.default.REIMBURSEMENT_ACCOUNT, { canBeMissing: true })[0];
    var fundList = (0, useOnyx_1.default)(ONYXKEYS_1.default.FUND_LIST, { canBeMissing: true })[0];
    var userWallet = (0, useOnyx_1.default)(ONYXKEYS_1.default.USER_WALLET, { canBeMissing: true })[0];
    var walletTerms = (0, useOnyx_1.default)(ONYXKEYS_1.default.WALLET_TERMS, { canBeMissing: true })[0];
    var loginList = (0, useOnyx_1.default)(ONYXKEYS_1.default.LOGIN_LIST, { canBeMissing: true })[0];
    var privatePersonalDetails = (0, useOnyx_1.default)(ONYXKEYS_1.default.PRIVATE_PERSONAL_DETAILS, { canBeMissing: true })[0];
    var allCards = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.CARD_LIST), { canBeMissing: true })[0];
    var hasBrokenFeedConnection = (0, CardUtils_1.checkIfFeedConnectionIsBroken)(allCards, CONST_1.default.EXPENSIFY_CARD.BANK);
    // All of the error & info-checking methods are put into an array. This is so that using _.some() will return
    // early as soon as the first error / info condition is returned. This makes the checks very efficient since
    // we only care if a single error / info condition exists anywhere.
    var errorChecking = (_a = {},
        _a[CONST_1.default.INDICATOR_STATUS.HAS_USER_WALLET_ERRORS] = Object.keys((_c = userWallet === null || userWallet === void 0 ? void 0 : userWallet.errors) !== null && _c !== void 0 ? _c : {}).length > 0,
        _a[CONST_1.default.INDICATOR_STATUS.HAS_PAYMENT_METHOD_ERROR] = (0, PaymentMethods_1.hasPaymentMethodError)(bankAccountList, fundList),
        _a[CONST_1.default.INDICATOR_STATUS.HAS_REIMBURSEMENT_ACCOUNT_ERRORS] = Object.keys((_d = reimbursementAccount === null || reimbursementAccount === void 0 ? void 0 : reimbursementAccount.errors) !== null && _d !== void 0 ? _d : {}).length > 0,
        _a[CONST_1.default.INDICATOR_STATUS.HAS_LOGIN_LIST_ERROR] = !!loginList && (0, UserUtils_1.hasLoginListError)(loginList),
        // Wallet term errors that are not caused by an IOU (we show the red brick indicator for those in the LHN instead)
        _a[CONST_1.default.INDICATOR_STATUS.HAS_WALLET_TERMS_ERRORS] = Object.keys((_e = walletTerms === null || walletTerms === void 0 ? void 0 : walletTerms.errors) !== null && _e !== void 0 ? _e : {}).length > 0 && !(walletTerms === null || walletTerms === void 0 ? void 0 : walletTerms.chatReportID),
        _a[CONST_1.default.INDICATOR_STATUS.HAS_CARD_CONNECTION_ERROR] = hasBrokenFeedConnection,
        _a[CONST_1.default.INDICATOR_STATUS.HAS_PHONE_NUMBER_ERROR] = (_g = !!((_f = privatePersonalDetails === null || privatePersonalDetails === void 0 ? void 0 : privatePersonalDetails.errorFields) === null || _f === void 0 ? void 0 : _f.phoneNumber)) !== null && _g !== void 0 ? _g : undefined,
        _a);
    var infoChecking = (_b = {},
        _b[CONST_1.default.INDICATOR_STATUS.HAS_LOGIN_LIST_INFO] = !!loginList && (0, UserUtils_1.hasLoginListInfo)(loginList),
        _b);
    var error = ((_h = Object.entries(errorChecking).find(function (_a) {
        var value = _a[1];
        return value;
    })) !== null && _h !== void 0 ? _h : [])[0];
    var info = ((_j = Object.entries(infoChecking).find(function (_a) {
        var value = _a[1];
        return value;
    })) !== null && _j !== void 0 ? _j : [])[0];
    var status = (error !== null && error !== void 0 ? error : info);
    var indicatorColor = error ? theme.danger : theme.success;
    return { indicatorColor: indicatorColor, status: status };
}
exports.default = useAccountTabIndicatorStatus;
