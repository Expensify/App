"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var Navigation_1 = require("@navigation/Navigation");
/**
 * Custom hook for tracking the first route rendered by navigation and determining focus state.
 *
 * @param [focusExceptionRoutes] - A function or an array of route names to exclude when determining if the current route is focused.
 * @param [shouldConsiderParams=false] - If true, considers route parameters when determining the active route.
 * @returns An object containing the initial route and a state indicating if the current route is focused.
 */
function useFirstRenderRoute(focusExceptionRoutes, shouldConsiderParams) {
    if (shouldConsiderParams === void 0) { shouldConsiderParams = false; }
    var initialRoute = (0, react_1.useRef)(null);
    (0, react_1.useEffect)(function () {
        Navigation_1.default.isNavigationReady().then(function () {
            if (initialRoute.current) {
                return;
            }
            initialRoute.current = shouldConsiderParams ? Navigation_1.default.getActiveRoute() : Navigation_1.default.getActiveRouteWithoutParams();
        });
    }, [shouldConsiderParams]);
    return {
        get isFocused() {
            var activeRoute = shouldConsiderParams ? Navigation_1.default.getActiveRoute() : Navigation_1.default.getActiveRouteWithoutParams();
            if (!focusExceptionRoutes || typeof focusExceptionRoutes === 'object') {
                var allRoutesToConsider = __spreadArray([initialRoute.current], (focusExceptionRoutes !== null && focusExceptionRoutes !== void 0 ? focusExceptionRoutes : []), true);
                return allRoutesToConsider.includes(activeRoute);
            }
            return focusExceptionRoutes(initialRoute.current) || initialRoute.current === activeRoute;
        },
        get value() {
            return initialRoute.current;
        },
    };
}
exports.default = useFirstRenderRoute;
