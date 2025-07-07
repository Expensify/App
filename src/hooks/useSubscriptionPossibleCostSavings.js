"use strict";
var _a, _b, _c, _d, _e, _f;
Object.defineProperty(exports, "__esModule", { value: true });
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var useOnyx_1 = require("./useOnyx");
var usePreferredCurrency_1 = require("./usePreferredCurrency");
var useSubscriptionPlan_1 = require("./useSubscriptionPlan");
var POSSIBLE_COST_SAVINGS = (_a = {},
    _a[CONST_1.default.PAYMENT_CARD_CURRENCY.USD] = (_b = {},
        _b[CONST_1.default.POLICY.TYPE.TEAM] = 1000,
        _b[CONST_1.default.POLICY.TYPE.CORPORATE] = 1800,
        _b),
    _a[CONST_1.default.PAYMENT_CARD_CURRENCY.AUD] = (_c = {},
        _c[CONST_1.default.POLICY.TYPE.TEAM] = 1400,
        _c[CONST_1.default.POLICY.TYPE.CORPORATE] = 3000,
        _c),
    _a[CONST_1.default.PAYMENT_CARD_CURRENCY.GBP] = (_d = {},
        _d[CONST_1.default.POLICY.TYPE.TEAM] = 800,
        _d[CONST_1.default.POLICY.TYPE.CORPORATE] = 1400,
        _d),
    _a[CONST_1.default.PAYMENT_CARD_CURRENCY.NZD] = (_e = {},
        _e[CONST_1.default.POLICY.TYPE.TEAM] = 1600,
        _e[CONST_1.default.POLICY.TYPE.CORPORATE] = 3200,
        _e),
    _a[CONST_1.default.PAYMENT_CARD_CURRENCY.EUR] = (_f = {},
        _f[CONST_1.default.POLICY.TYPE.TEAM] = 1000,
        _f[CONST_1.default.POLICY.TYPE.CORPORATE] = 1600,
        _f),
    _a);
function useSubscriptionPossibleCostSavings() {
    var preferredCurrency = (0, usePreferredCurrency_1.default)();
    var subscriptionPlan = (0, useSubscriptionPlan_1.default)();
    var privateSubscription = (0, useOnyx_1.default)(ONYXKEYS_1.default.NVP_PRIVATE_SUBSCRIPTION, { canBeMissing: true })[0];
    if (!subscriptionPlan || !(privateSubscription === null || privateSubscription === void 0 ? void 0 : privateSubscription.type)) {
        return 0;
    }
    return POSSIBLE_COST_SAVINGS[preferredCurrency][subscriptionPlan];
}
exports.default = useSubscriptionPossibleCostSavings;
