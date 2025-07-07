"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var Navigation_1 = require("@libs/Navigation/Navigation");
function useActiveRoute() {
    var currentReportRHPActiveRoute = (0, react_1.useRef)('');
    var getReportRHPActiveRoute = (0, react_1.useCallback)(function () {
        if (!currentReportRHPActiveRoute.current) {
            currentReportRHPActiveRoute.current = Navigation_1.default.getReportRHPActiveRoute();
        }
        return currentReportRHPActiveRoute.current;
    }, []);
    return { getReportRHPActiveRoute: getReportRHPActiveRoute };
}
exports.default = useActiveRoute;
