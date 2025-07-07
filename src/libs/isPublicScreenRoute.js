"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = isPublicScreenRoute;
var ROUTES_1 = require("@src/ROUTES");
function isPublicScreenRoute(route) {
    return Object.values(ROUTES_1.PUBLIC_SCREENS_ROUTES).some(function (screenRoute) {
        var routeRegex = new RegExp("^".concat(screenRoute.replace(/:\w+/g, '\\w+'), "$"));
        return routeRegex.test(route);
    });
}
