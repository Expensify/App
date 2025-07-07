"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var isNavigatorName_1 = require("@libs/Navigation/helpers/isNavigatorName");
function getIsScreenBlurred(state, currentRouteKey) {
    var lastFullScreenRoute = state.routes.findLast(function (route) { return (0, isNavigatorName_1.isFullScreenName)(route.name); });
    return (lastFullScreenRoute === null || lastFullScreenRoute === void 0 ? void 0 : lastFullScreenRoute.key) !== currentRouteKey;
}
exports.default = getIsScreenBlurred;
