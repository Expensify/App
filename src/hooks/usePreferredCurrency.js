"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var useOnyx_1 = require("./useOnyx");
/**
 * Get user's preferred currency in the following order:
 *
 * 1. Payment card currency
 * 2. User's local currency (if it's a valid payment card currency)
 * 3. USD (default currency)
 *
 */
function usePreferredCurrency() {
    var _a, _b, _c;
    var personalDetails = (0, useOnyx_1.default)(ONYXKEYS_1.default.PERSONAL_DETAILS_LIST)[0];
    var session = (0, useOnyx_1.default)(ONYXKEYS_1.default.SESSION)[0];
    var fundList = (0, useOnyx_1.default)(ONYXKEYS_1.default.FUND_LIST)[0];
    var paymentCardCurrency = (0, react_1.useMemo)(function () { var _a, _b; return (_b = (_a = Object.values(fundList !== null && fundList !== void 0 ? fundList : {}).find(function (card) { var _a, _b; return (_b = (_a = card.accountData) === null || _a === void 0 ? void 0 : _a.additionalData) === null || _b === void 0 ? void 0 : _b.isBillingCard; })) === null || _a === void 0 ? void 0 : _a.accountData) === null || _b === void 0 ? void 0 : _b.currency; }, [fundList]);
    if (paymentCardCurrency) {
        return paymentCardCurrency;
    }
    var currentUserLocalCurrency = ((_c = (_b = personalDetails === null || personalDetails === void 0 ? void 0 : personalDetails[(_a = session === null || session === void 0 ? void 0 : session.accountID) !== null && _a !== void 0 ? _a : CONST_1.default.DEFAULT_NUMBER_ID]) === null || _b === void 0 ? void 0 : _b.localCurrencyCode) !== null && _c !== void 0 ? _c : CONST_1.default.PAYMENT_CARD_CURRENCY.USD);
    return Object.values(CONST_1.default.PAYMENT_CARD_CURRENCY).includes(currentUserLocalCurrency) ? currentUserLocalCurrency : CONST_1.default.PAYMENT_CARD_CURRENCY.USD;
}
exports.default = usePreferredCurrency;
