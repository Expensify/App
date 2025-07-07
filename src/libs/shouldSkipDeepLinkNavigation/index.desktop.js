"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = shouldSkipDeepLinkNavigation;
var ROUTES_1 = require("@src/ROUTES");
function shouldSkipDeepLinkNavigation(route) {
    // When deep-linking to desktop app with `transition` route we don't want to call navigate
    // on the route because it will display an infinite loading indicator.
    // See issue: https://github.com/Expensify/App/issues/33149
    if (route.includes(ROUTES_1.default.TRANSITION_BETWEEN_APPS)) {
        return true;
    }
    return false;
}
