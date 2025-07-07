"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var useHasTeam2025Pricing_1 = require("./useHasTeam2025Pricing");
var useOnyx_1 = require("./useOnyx");
var usePreferredCurrency_1 = require("./usePreferredCurrency");
var useSubscriptionPlan_1 = require("./useSubscriptionPlan");
function useSubscriptionPrice() {
    var preferredCurrency = (0, usePreferredCurrency_1.default)();
    var subscriptionPlan = (0, useSubscriptionPlan_1.default)();
    var hasTeam2025Pricing = (0, useHasTeam2025Pricing_1.default)();
    var privateSubscription = (0, useOnyx_1.default)(ONYXKEYS_1.default.NVP_PRIVATE_SUBSCRIPTION)[0];
    var subscriptionType = privateSubscription === null || privateSubscription === void 0 ? void 0 : privateSubscription.type;
    if (!subscriptionPlan || !subscriptionType) {
        return 0;
    }
    if (hasTeam2025Pricing && subscriptionPlan === CONST_1.default.POLICY.TYPE.TEAM) {
        return CONST_1.default.SUBSCRIPTION_PRICES[preferredCurrency][subscriptionPlan][CONST_1.default.SUBSCRIPTION.PRICING_TYPE_2025];
    }
    return CONST_1.default.SUBSCRIPTION_PRICES[preferredCurrency][subscriptionPlan][subscriptionType];
}
exports.default = useSubscriptionPrice;
