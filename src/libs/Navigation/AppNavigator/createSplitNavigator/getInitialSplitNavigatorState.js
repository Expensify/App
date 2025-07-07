"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var RELATIONS_1 = require("@libs/Navigation/linkingConfig/RELATIONS");
// The function getPathFromState that we are using in some places isn't working correctly without defined index.
var getRoutesWithIndex = function (routes) { return ({ routes: routes, index: routes.length - 1 }); };
function getInitialSplitNavigatorState(splitNavigatorSidebarRoute, route, splitNavigatorParams) {
    var routes = [];
    routes.push(splitNavigatorSidebarRoute);
    if (route) {
        routes.push(route);
    }
    return {
        name: RELATIONS_1.SIDEBAR_TO_SPLIT[splitNavigatorSidebarRoute.name],
        state: getRoutesWithIndex(routes),
        params: splitNavigatorParams,
    };
}
exports.default = getInitialSplitNavigatorState;
