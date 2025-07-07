"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var isNavigatorName_1 = require("@libs/Navigation/helpers/isNavigatorName");
// Visible directly means not through the overlay. So the full screen (split navigator or search) has to be the last route on the root stack.
function getIsNavigationTabBarVisibleDirectly(state) {
    var _a;
    return (0, isNavigatorName_1.isFullScreenName)((_a = state === null || state === void 0 ? void 0 : state.routes.at(-1)) === null || _a === void 0 ? void 0 : _a.name);
}
exports.default = getIsNavigationTabBarVisibleDirectly;
